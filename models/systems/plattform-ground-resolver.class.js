
import Tileset from "../environment/tileset.class.js";

export default class PlattformGroundResolver {
    constructor(world) {
        this.world = world;
    }

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

  canResolvePlatformGround(actor) {
    return !!actor && typeof actor.getHitbox === "function";
  }

  resetActorGround(actor) {
    actor.groundY = actor.defaultGroundY ?? actor.groundY;
  }

  getActorGroundContext(actor) {
    const actorHitbox = actor.getHitbox();
    const actorPreviousBottom = this.getActorPreviousBottom(actor);
    const actorCurrentBottom = actorHitbox.y + actorHitbox.height;

    return { actorHitbox, actorPreviousBottom, actorCurrentBottom };
  }

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

  selectHigherPlatform(currentBest, candidate) {
    if (!currentBest) {
      return candidate;
    }

    return candidate.y < currentBest.y ? candidate : currentBest;
  }

  getActorPreviousBottom(actor) {
    return (
      (actor.previousY ?? actor.y) +
      (actor.hitboxOffsetY ?? 0) +
      (actor.hitboxHeight ?? actor.height)
    );
  }

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

  isStandingOnPlatform(actorCurrentBottom, platformBox) {
    return Math.abs(actorCurrentBottom - platformBox.y) <= 6;
  }

  getPlatformGroundY(actor, platformBox) {
    return (
      platformBox.y -
      (actor.hitboxOffsetY ?? 0) -
      (actor.hitboxHeight ?? actor.height)
    );
  }

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

  shouldKeepSingleTile(tile) {
    return this.isFloatingTile(tile) || this.isSpikeTile(tile);
  }

  isFloatingTile(tile) {
    return tile.img.src.includes("floating");
  }

  isSpikeTile(tile) {
    return tile.img.src.includes("spikes");
  }

  addRepeatingTiles(tile, stepX, targetTiles) {
    for (let x = tile.x; x < this.world.canvas.width * 6; x += stepX) {
      targetTiles.push(
        new Tileset(tile.img.src, x, tile.y, tile.width, tile.height),
      );
    }
  }
}