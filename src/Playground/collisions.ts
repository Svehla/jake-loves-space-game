import { Angle, isAngleInArcSector } from './mathCalc'
import { Circle, GameElement, GameElementType, Radar, Rectangle } from './gameElementTypes'

export const isTwoElementCollision = (circleShape1: Circle, shape2: GameElement) => {
  switch (shape2.type) {
    case GameElementType.Circle:
      return isCircleCircleCollision(circleShape1, shape2)
    case GameElementType.Rectangle:
      return isRectangleCircleCollision(circleShape1, shape2)
  }
}

/**
 * TODO: correct arc collision ->
 *
 * now its arc -> Point collision
 */
export const arcRectCollision = (arc: Radar, shape2: GameElement) => {
  switch (shape2.type) {
    case GameElementType.Circle:
      return isPointArcCollision(arc, {
        // for easier math I temporary transform circles into rectangles
        type: GameElementType.Rectangle,
        x: shape2.x,
        y: shape2.y,
        width: shape2.radius,
        height: shape2.radius,
      })
    case GameElementType.Rectangle:
      return isPointArcCollision(arc, shape2)
  }
}

/**
 *
 * Find angle between two elements and check if this angle is between arc startAngle & endAngle
 *
 * ## Math helper for my future me
 * for each sector i calculate ratio of triangle sides
 *
 * `atan` calculate opposite to adjacent side.In our case its `y/x` like:
 *
 * | q. 1 | q.2 | q. 3 | q. 4 |
 * |------|------|------|------|
 * | C___ | C___ | C    |    C |
 * |    | | |    | |    |    | |
 * |  \ | | | /  | | \  |  / | |
 * |    y | y    | ___x | x___ |
 * |      |      |      |      |
 * ---------------------------
 * * x -> x axis
 * * y -> y axis
 * * C -> relative center (0, 0)
 *
 * on diagram below you can see math quadrants
 *
 * -----------------
 * | 3→ pa | 4↓ na |
 * |-------|-------| 0deg - 360deg
 * | ↑2 na | ←1 pa |
 * -----------------
 * * pa -> returns positive angle
 * * na -> returns negative angle
 *
 * ## different behavior for left and right half of quadrant
 * * q.2 + q.3 - we have to add 180deg for correct angle value
 * * q4        - returns negative number -> so we correct it back to 360 range
 */
const isPointArcCollision = (arc: Radar, rect: Rectangle) => {
  const xDistance = rect.x - arc.x1
  const yDistance = rect.y - arc.y1

  // opposite to adjacent triangle side
  const arcRecCalcAngle = Angle.toDegrees(Math.atan(yDistance / xDistance))

  //
  let arcRecAngle
  if (xDistance < 0) {
    // quadrant 2 & 3
    arcRecAngle = Angle.add(180, arcRecCalcAngle)
  } else {
    // quadrant 1 & 4
    arcRecAngle = Angle.to360Range(arcRecCalcAngle)
  }

  const startAngle = arc.rotation
  const endAngle = Angle.add(arc.rotation, arc.sectorAngle)
  return isAngleInArcSector(arcRecAngle, startAngle, endAngle)
}

const isRectangleCircleCollision = (circle: Circle, rect: Rectangle) => {
  const distanceX = Math.abs(circle.x - rect.x - rect.width / 2)
  const distanceY = Math.abs(circle.y - rect.y - rect.height / 2)

  if (distanceX > rect.width / 2 + circle.radius) {
    return false
  }

  if (distanceY > rect.height / 2 + circle.radius) {
    return false
  }

  if (distanceX <= rect.width / 2) {
    return true
  }

  if (distanceY <= rect.height / 2) {
    return true
  }

  const dx = distanceX - rect.width / 2
  const dy = distanceY - rect.height / 2
  return dx * dx + dy * dy <= circle.radius * circle.radius
}

/**
 * inspiration:
 * > https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
 */
const isCircleCircleCollision = (circle1: Circle, circle2: Circle): boolean => {
  const dx = circle1.x - circle2.x
  const dy = circle1.y - circle2.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < circle1.radius + circle2.radius
}
