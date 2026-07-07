export default class CharacterMovement {
  constructor(character) {
    this.character = character;
  }

  animate() {
    this.character.startInterval(() => this.tick(), 1000 / 60);
  }

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

  isAttackPressedNow() {
    const isPressed = Boolean(this.character.world?.keyboard?.ATTACK);
    const pressedNow = isPressed && !this.character.wasAttackPressed;
    this.character.wasAttackPressed = isPressed;
    return pressedNow;
  }

  isMagicAttackPressedNow() {
    const isPressed = Boolean(this.character.world?.keyboard?.MAGIC_ATTACK);
    const pressedNow = isPressed && !this.character.wasMagicAttackPressed;
    this.character.wasMagicAttackPressed = isPressed;
    return pressedNow;
  }

  handleMovementInput() {
    if (this.character.energy <= 0) {
      this.character.speedY = 0;
      return;
    }

    this.handleJumpInput();
    this.handleFallInput();
    this.handleHorizontalInput();
  }

  handleJumpInput() {
    const isJumpPressed =
      this.character.world.keyboard.SPACE || this.character.world.keyboard.UP;
    if (!this.character.isAboveGround() && isJumpPressed) {
      this.character.jump(25);
    }
  }

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

  handleHorizontalInput() {
    if (this.character.world.keyboard.RIGHT || this.character.world.keyboard.LEFT) {
      this.moveCharacter();
    }
  }

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