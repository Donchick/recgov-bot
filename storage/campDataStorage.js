class CampDataStorage {
  static #db = {
    '232449': 'Yosemity(North Pines)',
    '232450': 'Yosemity(Low Pines)',
    '232447': 'Yosemity(Upper Pines)',
    '232768': 'Tahoe(Nevada Beach)',
  };

  static getCampNameById(id) {
    if (this.#db[id]) {
      return this.#db[id];
    }

    throw new Error('No campground name found by provided id - ' + id);
  };
}

module.exports = CampDataStorage;