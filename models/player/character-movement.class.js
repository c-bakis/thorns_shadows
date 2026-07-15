/** Handles player movement and input processing per frame. */
export default class CharacterMovement {
  /** @param {Character} character */
  constructor(character) {
    this.character = character;
  }

  /** Starts the movement update loop at 60 FPS. */
  animate() {
    this.character.startInterval(() => this.tick(), 1000 / 60);
  }

  /** Runs one movement tick and updates animation state. */
  tick() {
    if (!this.character.world?.keyboard) {
      return;
    }

    if (this.character.world?.isGameplayFrozen?.(this.character)) {
      return;
    }

    const now = Date.now();
    const previousX = this.character.x;

    this.handleInput(now);
    const isMovingHorizontally = this.character.x !== previousX;
    this.character.updateAnimation(
      isMovingHorizontally,
      this.character.isAboveGround(),
      this.character.isHurt(),
      now,
    );
  }

  /**
   * Processes combat and movement inputs for the current frame.
   * @param {number} now
   */
  handleInput(now) {
    if (this.isAttackPressedNow()) {
      this.character.combat.handleAttackInput(now);
    }

    if (this.isMagicAttackPressedNow()) {
      this.character.combat.handleMagicAttackInput(now);
    }

    if (!this.character.combat.isBusy()) {
      this.handleMovementInput();
    }
  }

  /** Returns true only on the attack key down edge. */
  isAttackPressedNow() {
    const isPressed = Boolean(this.character.world?.keyboard?.ATTACK);
    const pressedNow = isPressed && !this.character.wasAttackPressed;
    this.character.wasAttackPressed = isPressed;
    return pressedNow;
  }

  /** Returns true only on the magic-attack key down edge. */
  isMagicAttackPressedNow() {
    const isPressed = Boolean(this.character.world?.keyboard?.MAGIC_ATTACK);
    const pressedNow = isPressed && !this.character.wasMagicAttackPressed;
    this.character.wasMagicAttackPressed = isPressed;
    return pressedNow;
  }

  /** Handles jump/fall/horizontal movement when the character can move. */
  handleMovementInput() {
    if (this.character.energy <= 0) {
      this.character.speedY = 0;
      return;
    }

    this.handleJumpInput();
    this.handleFallInput();
    this.handleHorizontalInput();
  }

  /** Applies jump impulse when jump input is pressed on ground. */
  handleJumpInput() {
    const isJumpPressed =
      this.character.world.keyboard.SPACE || this.character.world.keyboard.UP;
    if (!this.character.isAboveGround() && isJumpPressed) {
      this.character.jump(25);
    }
  }

  /** Handles fast-fall input in air or snaps to ground when grounded. */
  handleFallInput() {
    if (!this.character.world.keyboard.DOWN) {
      return;
    }

    if (this.character.isAboveGround()) {
      this.character.jump(-25);
    } else {
      this.character.resetPositionY(this.character.groundY);
    }
  }

  /** Triggers horizontal movement handling if left or right is pressed. */
  handleHorizontalInput() {
    if (this.character.world.keyboard.RIGHT || this.character.world.keyboard.LEFT) {
      this.moveCharacter();
    }
  }

  /** Moves the character within level bounds. */
  moveCharacter() {
    const worldEndX = this.character.world?.level?.levelEndX ?? Infinity;
    const maxCharacterX = worldEndX - this.character.width;

    if (this.character.world.keyboard.RIGHT && this.character.x < maxCharacterX) {
      this.character.moveRight();
      this.character.x = Math.min(this.character.x, maxCharacterX);
    }

    if (this.character.world.keyboard.LEFT && this.character.x >= 80) {
      this.character.moveLeft();
    }
  }
}