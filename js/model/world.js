define(function(require) {
  'use strict';

  var $ = require('jquery'),
      _ = require('underscore'),
      Car = require('model/car'),
      Intersection = require('model/intersection'),
      Road = require('model/road'),
      Pool = require('model/pool');

  function World() {
    this.set({});
  }

  World.prototype.set = function(o) {
    o = o || {};
    this.intersections = new Pool(Intersection, o.intersections);
    this.roads = new Pool(Road, o.roads);
    this.cars = new Pool(Car, o.cars);
    this.ticks = o.ticks || 0;
    this.carsNumber = 0;
    window.__nextId = o.__nextId || 1;
  };

  World.prototype.save = function() {
    var data = $.extend({}, this);
    data.nextId = window.__nextId;
    delete data.cars;
    localStorage.world = JSON.stringify(data);
  };

  World.prototype.load = function() {
    var data = localStorage.world;
    data = data && JSON.parse(data);
    if (data) {
      this.clear();
      window.__nextId = data.nextId || 1;
      this.carsNumber = data.carsNumber || 0;
      _.each(data.intersections, function(intersection) {
        intersection = Intersection.copy(intersection);
        this.addIntersection(intersection);
      }, this);
      _.each(data.roads, function(road) {
        road = Road.copy(road);
        road.source = this.getIntersection(road.source);
        road.target = this.getIntersection(road.target);
        this.addRoad(road);
      }, this);
    }
  };

  World.prototype.clear = function() {
    this.set({});
  };

  World.prototype.onTick = function(delta) {
    if (delta > 1) {
      throw Error('delta can\'t be more than 1');
    }
    this.ticks++;
    this.refreshCars();
    _.each(this.intersections.all(), function(intersection) {
      intersection.controlSignals.onTick(delta);
    }, this);
    _.each(this.cars.all(), function(car) {
      car.move(delta);
      if (!car.alive) {
        this.removeCar(car);
      }
    }, this);
  };

  World.prototype.refreshCars = function() {
    while (this.cars.length < this.carsNumber) {
      if (!this.addRandomCar()) {
        break;
      }
    }
    while (this.cars.length > this.carsNumber) {
      if (!this.removeRandomCar()) {
        break;
      }
    }
  };

  World.prototype.addRoad = function(road) {
    this.roads.put(road);
    road.source.roads.push(road);
    road.target.inRoads.push(road);
    road.update();
  };

  World.prototype.getRoad = function(id) {
    return this.roads.get(id);
  };

  World.prototype.addCar = function(car) {
    this.cars.put(car);
  };

  World.prototype.getCar = function(id) {
    return this.cars.get(id);
  };

  World.prototype.removeCar = function(car) {
    this.cars.pop(car);
  };

  World.prototype.addIntersection = function(intersection) {
    this.intersections.put(intersection);
  };

  World.prototype.getIntersection = function(id) {
    return this.intersections.get(id);
  };

  World.prototype.addRandomCar = function() {
    // pick intersection with the only one road
    var road = null;
    /* var singleRoadIntersections = _.filter(this.intersections.all(),
        function(intersection) {
            return intersection.roads.length === 1;
        }, this);
        if (singleRoadIntersections.length) {
            var intersection = _.sample(singleRoadIntersections);
            road = intersection.roads[0];
        } */
    if (road === null) {
      road = _.sample(this.roads.all());
    }
    if (road) {
      var lane = _.sample(road.lanes);
      if (lane) {
        this.addCar(new Car(lane));
      }
      return true;
    }
    return false;
  };

  World.prototype.removeRandomCar = function() {
    var car = _.sample(this.cars.all());
    if (car) {
      this.removeCar(car);
      return true;
    }
    return false;
  };

  Object.defineProperty(World.prototype, 'instantSpeed', {
    get: function() {
      var speeds = _.map(this.cars.all(), function(car) {
        return car.speed;
      });
      if (speeds.length === 0) {
        return 0.0;
      }
      return _.reduce(speeds, function(a, b) { return a + b; }) / speeds.length;
    }
  });

  return World;
});