package com.example.graph

import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

data class SimNode(
  val id: String,
  var x: Float,
  var y: Float,
  var vx: Float = 0f,
  var vy: Float = 0f,
  var fx: Float? = null,
  var fy: Float? = null,
  val radius: Float = 36f,
  val mass: Float = 1f,
  val isGateway: Boolean = false,
  var isPinned: Boolean = false
)

data class SimLink(
  val sourceId: String,
  val targetId: String,
  val targetDistance: Float = 150f,
  val strength: Float = 0.7f
)

class ForceSimulation(
  nodes: List<SimNode> = emptyList(),
  links: List<SimLink> = emptyList(),
  var centerX: Float = 500f,
  var centerY: Float = 500f
) {
  val nodeList: MutableList<SimNode> = nodes.toMutableList()
  val linkList: MutableList<SimLink> = links.toMutableList()

  var alpha: Float = 1.0f
  var alphaTarget: Float = 0.0f
  var alphaDecay: Float = 0.022f
  var alphaMin: Float = 0.001f
  var velocityDecay: Float = 0.88f

  var repulsionStrength: Float = 12000f
  var centerGravity: Float = 0.04f
  var linkStrengthFactor: Float = 1.0f

  fun updateData(newNodes: List<SimNode>, newLinks: List<SimLink>) {
    val existingMap = nodeList.associateBy { it.id }
    val merged = newNodes.map { newNode ->
      val old = existingMap[newNode.id]
      if (old != null) {
        newNode.copy(
          x = old.x,
          y = old.y,
          vx = old.vx,
          vy = old.vy,
          fx = old.fx,
          fy = old.fy,
          isPinned = old.isPinned
        )
      } else {
        newNode
      }
    }
    nodeList.clear()
    nodeList.addAll(merged)
    linkList.clear()
    linkList.addAll(newLinks)
    reheat()
  }

  fun reheat(targetAlpha: Float = 0.75f) {
    alpha = max(alpha, targetAlpha)
  }

  fun tick() {
    if (alpha <= alphaMin) return

    val n = nodeList.size
    val nodeMap = nodeList.associateBy { it.id }

    // 1. Repulsion force between all node pairs (Coulomb's Law with softening)
    for (i in 0 until n) {
      val nodeA = nodeList[i]
      for (j in i + 1 until n) {
        val nodeB = nodeList[j]
        val dx = nodeB.x - nodeA.x
        val dy = nodeB.y - nodeA.y
        val distSq = dx * dx + dy * dy + 100f
        val dist = sqrt(distSq)

        // Extra repulsion for gateway or large nodes
        val weight = if (nodeA.isGateway || nodeB.isGateway) 2.2f else 1.0f
        val force = (repulsionStrength * weight) / (distSq * dist) * alpha

        val fx = dx * force
        val fy = dy * force

        nodeA.vx -= fx / nodeA.mass
        nodeA.vy -= fy / nodeA.mass
        nodeB.vx += fx / nodeB.mass
        nodeB.vy += fy / nodeB.mass

        // Collision avoidance padding
        val minDist = nodeA.radius + nodeB.radius + 20f
        if (dist < minDist && dist > 0.001f) {
          val overlap = (minDist - dist) * 0.5f * alpha
          val nx = dx / dist
          val ny = dy / dist
          nodeA.vx -= nx * overlap
          nodeA.vy -= ny * overlap
          nodeB.vx += nx * overlap
          nodeB.vy += ny * overlap
        }
      }
    }

    // 2. Spring force along links (Hooke's Law)
    for (link in linkList) {
      val source = nodeMap[link.sourceId] ?: continue
      val target = nodeMap[link.targetId] ?: continue

      val dx = target.x - source.x
      val dy = target.y - source.y
      val dist = sqrt(dx * dx + dy * dy + 0.01f)

      val targetDist = link.targetDistance
      val displacement = (dist - targetDist) / dist * link.strength * linkStrengthFactor * alpha

      val fx = dx * displacement * 0.5f
      val fy = dy * displacement * 0.5f

      source.vx += fx / source.mass
      source.vy += fy / source.mass
      target.vx -= fx / target.mass
      target.vy -= fy / target.mass
    }

    // 3. Center gravity force (pulls towards canvas center or cluster focus)
    for (node in nodeList) {
      val dx = centerX - node.x
      val dy = centerY - node.y

      // Gateway gets stronger pull to center
      val grav = if (node.isGateway) centerGravity * 2.5f else centerGravity
      node.vx += dx * grav * alpha
      node.vy += dy * grav * alpha
    }

    // 4. Update positions with velocity and damping
    for (node in nodeList) {
      node.vx *= velocityDecay
      node.vy *= velocityDecay

      if (node.fx != null) {
        node.x = node.fx!!
        node.vx = 0f
      } else {
        node.x += node.vx
      }

      if (node.fy != null) {
        node.y = node.fy!!
        node.vy = 0f
      } else {
        node.y += node.vy
      }
    }

    // 5. Alpha cooling
    alpha += (alphaTarget - alpha) * alphaDecay
    if (alpha < alphaMin) {
      alpha = 0f
    }
  }

  fun onDragStart(nodeId: String, currentX: Float, currentY: Float) {
    val node = nodeList.find { it.id == nodeId } ?: return
    node.fx = currentX
    node.fy = currentY
    reheat(0.6f)
  }

  fun onDragMove(nodeId: String, newX: Float, newY: Float) {
    val node = nodeList.find { it.id == nodeId } ?: return
    node.fx = newX
    node.fy = newY
    reheat(0.4f)
  }

  fun onDragEnd(nodeId: String) {
    val node = nodeList.find { it.id == nodeId } ?: return
    if (!node.isPinned) {
      node.fx = null
      node.fy = null
    }
    reheat(0.2f)
  }

  fun togglePin(nodeId: String): Boolean {
    val node = nodeList.find { it.id == nodeId } ?: return false
    node.isPinned = !node.isPinned
    if (node.isPinned) {
      node.fx = node.x
      node.fy = node.y
    } else {
      node.fx = null
      node.fy = null
      reheat(0.4f)
    }
    return node.isPinned
  }

  fun findNodeAt(x: Float, y: Float, thresholdMultiplier: Float = 1.3f): SimNode? {
    return nodeList.reversed().firstOrNull { node ->
      val dx = node.x - x
      val dy = node.y - y
      val hitRadius = node.radius * thresholdMultiplier
      (dx * dx + dy * dy) <= (hitRadius * hitRadius)
    }
  }
}
