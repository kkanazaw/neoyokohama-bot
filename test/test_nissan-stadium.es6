"use strict";

import helper from "./test_helper";
import assert from "assert";
import NissanStadium from "../src/nissan-stadium";


describe("crawler NissanStadium", function(){

  const nissan = new NissanStadium();

  it("should have method \"getMajorSchedules\"", function(){
    assert.equal(typeof nissan["getMajorSchedules"], "function");
  });

  describe("method \"getMajorSchedules\"", function(){

    it("should return Array", function(done){
      this.timeout(10000);
      nissan
        .getMajorSchedules()
        .then((schedules) => {
          assert.equal(schedules instanceof Array, true);
          done();
        });

    });
  });

});