
import Tileset from "../environment/tileset.class.js";

export default class PlattformGroundResolver {
    constructor(world) {
        this.world = world;
    }

      /**
       * Runs resolve platform ground.
       * @returns {object|null}
       */
      resolvePlatformGround() {
    const actor = this.world.character;
    if (!this.canResolvePlatformGround(actor)) {
      return;
    }

    this.resetActorGround(actor);

    const { actorHitbox, actorPreviousBottom, actorCurrentBottom } =
      this.getActorGroundContext(actor);

    const bestPlatform = this.findBestFloatingPlatform(
      actor,
      actorHitbox,
      actorPreviousBottom,
      actorCurrentBottom,
    );

    if (!bestPlatform) {
      return;
    }

    this.applyPlatformGround(actor, bestPlatform);
  }

  /**
   * Checks whether this object can resolve platform ground.
   * @param {object} actor
   * @returns {boolean}
   */
  canResolvePlatformGround(actor) {
    return !!actor && typeof actor.getHitbox === "function";
  }

  /**
   * Resets actor ground.
   * @param {object} actor
   * @returns {void}
   */
  resetActorGround(actor) {
    actor.groundY = actor.defaultGroundY ?? actor.groundY;
  }

  /**
   * Retrieves actor ground context.
   * @param {object} actor
   * @returns {object|null}
   */
  getActorGroundContext(actor) {
    const actorHitbox = actor.getHitbox();
    const actorPreviousBottom = this.getActorPreviousBottom(actor);
    const actorCurrentBottom = actorHitbox.y + actorHitbox.height;

    return { actorHitbox, actorPreviousBottom, actorCurrentBottom };
  }

  /**
   * Applies platform ground.
   * @param {object} actor
   * @param {object} platformBox
   * @returns {void}
   */
  applyPlatformGround(actor, platformBox) {
    const platformGroundY = this.getPlatformGroundY(actor, platformBox);
    actor.groundY = platformGroundY;

    if (actor.y > platformGroundY) {
      actor.resetPositionY(platformGroundY);
    }
  }

  findBestFloatingPlatform(
    actor,
    actorHitbox,
    actorPreviousBottom,
    actorCurrentBottom,
  ) {
    let bestPlatformBox = null;

    for (const tile of this.getFloatingTiles()) {
      const platformBox = this.getValidFloatingPlatformBox(
        tile,
        actor,
        actorHitbox,
        actorPreviousBottom,
        actorCurrentBottom,
      );

      if (!platformBox) {
        continue;
      }

      bestPlatformBox = this.selectHigherPlatform(bestPlatformBox, platformBox);
    }

    return bestPlatformBox;
  }

  /**
   * Retrieves floating tiles.
   * @returns {object[]}
   */
  getFloatingTiles() {
    return this.world.tileset.filter((tile) => this.isFloatingTile(tile));
  }

  getValidFloatingPlatformBox(
    tile,
    actor,
    actorHitbox,
    actorPreviousBottom,
    actorCurrentBottom,
  ) {
    const platformBox = this.world.getObjectBox(tile);

    if (
      !this.isFloatingPlatformCandidate(
        actor,
        actorHitbox,
        actorPreviousBottom,
        actorCurrentBottom,
        platformBox,
      )
    ) {
      return null;
    }

    return platformBox;
  }

  isFloatingPlatformCandidate(
    actor,
    actorHitbox,
    actorPreviousBottom,
    actorCurrentBottom,
    platformBox,
  ) {
    if (!this.isHorizontalOverlap(actorHitbox, platformBox)) {
      return false;
    }

    const landsNow = this.isLandingOnPlatform(
      actor,
      actorPreviousBottom,
      actorCurrentBottom,
      platformBox,
    );
    const standsNow = this.isStandingOnPlatform(
      actorCurrentBottom,
      platformBox,
    );

    return landsNow || standsNow;
  }

  /**
   * Runs select higher platform.
   * @param {object} currentBest
   * @param {boolean} candidate
   * @returns {void}
   */
  selectHigherPlatform(currentBest, candidate) {
    if (!currentBest) {
      return candidate;
    }

    return candidate.y < currentBest.y ? candidate : currentBest;
  }

  /**
   * Retrieves actor previous bottom.
   * @param {object} actor
   * @returns {object|null}
   */
  getActorPreviousBottom(actor) {
    return (
      (actor.previousY ?? actor.y) +
      (actor.hitboxOffsetY ?? 0) +
      (actor.hitboxHeight ?? actor.height)
    );
  }

  /**
   * Checks whether this object is horizontal overlap.
   * @param {object} actorHitbox
   * @param {object} platformBox
   * @returns {boolean}
   */
  isHorizontalOverlap(actorHitbox, platformBox) {
    return (
      actorHitbox.x < platformBox.x + platformBox.width &&
      actorHitbox.x + actorHitbox.width > platformBox.x
    );
  }

  isLandingOnPlatform(
    actor,
    actorPreviousBottom,
    actorCurrentBottom,
    platformBox,
  ) {
    return (
      actor.speedY <= 0 &&
      actorPreviousBottom <= platformBox.y &&
      actorCurrentBottom >= platformBox.y
    );
  }

  /**
   * Checks whether this object is standing on platform.
   * @param {object} actorCurrentBottom
   * @param {object} platformBox
   * @returns {boolean}
   */
  isStandingOnPlatform(actorCurrentBottom, platformBox) {
    return Math.abs(actorCurrentBottom - platformBox.y) <= 6;
  }

  /**
   * Retrieves platform ground y.
   * @param {object} actor
   * @param {object} platformBox
   * @returns {object|null}
   */
  getPlatformGroundY(actor, platformBox) {
    return (
      platformBox.y -
      (actor.hitboxOffsetY ?? 0) -
      (actor.hitboxHeight ?? actor.height)
    );
  }

    /**
     * Runs fill tiles across ground.
     * @returns {void}
     */
    fillTilesAcrossGround() {
    const baseTiles = [...this.world.tileset];
    const filledTiles = [];

    baseTiles.forEach((tile) => {
      const isGrassTile = tile.img.src.includes("grass");
      const stepX = isGrassTile ? tile.width - 0 : tile.width;

      if (this.shouldKeepSingleTile(tile)) {
        filledTiles.push(tile);
        return;
      }

      this.addRepeatingTiles(tile, stepX, filledTiles);
    });

    return filledTiles;
  }

  /**
   * Checks whether keep single tile.
   * @param {object} tile
   * @returns {boolean}
   */
  shouldKeepSingleTile(tile) {
    return this.isFloatingTile(tile) || this.isSpikeTile(tile);
  }

  /**
   * Checks whether this object is floating tile.
   * @param {object} tile
   * @returns {boolean}
   */
  isFloatingTile(tile) {
    return tile.img.src.includes("floating");
  }

  /**
   * Checks whether this object is spike tile.
   * @param {object} tile
   * @returns {boolean}
   */
  isSpikeTile(tile) {
    return tile.img.src.includes("spikes");
  }

  /**
   * Runs add repeating tiles.
   * @param {object} tile
   * @param {object} stepX
   * @param {object} targetTiles
   * @returns {void}
   */
  addRepeatingTiles(tile, stepX, targetTiles) {
    for (let x = tile.x; x < this.world.canvas.width * 6; x += stepX) {
      targetTiles.push(
        new Tileset(tile.img.src, x, tile.y, tile.width, tile.height),
      );
    }
  }
}
