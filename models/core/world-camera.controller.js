export default class WorldCameraController {
  constructor(world) {
    this.world = world;
  }

  /**
   * Handles update camera.
   * @returns {void}
   */
  updateCamera() {
    if (this.world.isBossIntroActive()) {
      this.focusCameraOnActor(this.world.bossIntroState.actor);
      return;
    }

    const deltaFromAnchor = this.world.character.x - this.world.cameraAnchorX;
    const deltaYUp = this.world.cameraAnchorY - this.world.character.y;
    let nextCameraX = -this.world.cameraAnchorX;
    let nextCameraY = 0;

    if (deltaFromAnchor > this.world.cameraDeadZone) {
      nextCameraX = -(this.world.character.x - this.world.cameraDeadZone);
    } else if (deltaFromAnchor < -this.world.cameraDeadZone) {
      nextCameraX = -(this.world.character.x + this.world.cameraDeadZone);
    }

    const bounds = this.getCameraBounds();
    this.world.camera_x = this.clamp(nextCameraX, bounds.min, bounds.max);

    if (deltaYUp > this.world.cameraDeadZoneY) {
      nextCameraY = deltaYUp - this.world.cameraDeadZoneY;
    }
    this.world.camera_y = this.clamp(nextCameraY, 0, this.world.cameraMaxUp);
  }

  /**
   * Handles focus camera on actor.
   * @param {object} actor
   * @returns {void}
   */
  focusCameraOnActor(actor) {
    if (!actor) {
      return;
    }

    const actorCenterX = actor.x + actor.width / 2;
    const actorTopY = actor.y;
    const nextCameraX = -(actorCenterX - this.world.canvas.width / 2);
    const nextCameraY = Math.max(0, this.world.cameraMaxUp - actorTopY + 40);
    const bounds = this.getCameraBounds();

    this.world.camera_x = this.clamp(nextCameraX, bounds.min, bounds.max);
    this.world.camera_y = this.clamp(nextCameraY, 0, this.world.cameraMaxUp);
  }

  /**
   * Handles retrieve camera bounds.
   * @returns {object}
   */
  getCameraBounds() {
    const max = -this.world.cameraAnchorX;
    const levelEndX = this.world.level?.levelEndX;

    if (!Number.isFinite(levelEndX) || !Number.isFinite(this.world.canvas?.width)) {
      return { min: -Infinity, max };
    }

    const min = Math.min(max, this.world.canvas.width - levelEndX);
    return { min, max };
  }

  /**
   * Handles clamp.
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
}
