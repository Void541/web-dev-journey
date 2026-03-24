export function levelsSystem() {

const experience = 0;
const levelUpExperience = 100;

function gainExperience(amount) {
  experience += amount;
  if (experience >= levelUpExperience) {
    levelUp();
  }
}

}