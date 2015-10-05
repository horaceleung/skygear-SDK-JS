import {expect, assert} from 'chai';
import Database from '../lib/database';
import Record from '../lib/record';
import Query from '../lib/query';
import Container from '../lib/container';

import mockSuperagent from './mock/superagent';

let request = mockSuperagent([{
  pattern: 'http://ourd.dev/record/query',
  fixtures: function (match, params, headers, fn) {
    if (params['database_id'] === '_public') {
      return fn({
        'result': [{
          '_id': 'note/6495FFA6-C8BB-4A65-8DA0-5B84DC54D74B',
          'content':'hi ourd',
          'noteOrder': 1,
          'tags':[]
        }, {
          '_id': 'note/56F12880-3004-4723-B94A-0AC86DF13916',
          'content':'limouren',
          'noteOrder': 2
        }]
      });
    }
  }
}, {
  pattern: 'http://ourd.dev/record/save',
  fixtures: function (match, params, headers, fn) {
    if (params['database_id'] === '_public') {
      return fn({
        'result': [{
          '_type': 'record',
          '_id': 'note/b488de75-16f9-48bd-b450-7cb078d645fe',
          '_ownerID': 'rick.mak@gmail.com',
          '_access': null
        }]
      });
    }
  }
}, {
  pattern: 'http://ourd.dev/record/delete',
  fixtures: function (match, params, headers, fn) {
    if (params['database_id'] === '_public' && params['ids']) {
      return fn({
        'result': [{
          '_id':'note/c9b3b7d3-07ea-4b62-ac6a-50e1f0fb0a3d',
          '_type':'record'
        }]
      });
    }
  }
}]);

describe('Database', function () {

  let container = new Container();
  container.request = request;
  container.configApiKey('correctApiKey');
  let db = new Database('_public', container);
  let Note = Record.extend('note');

  it('Reject invalid database_id', function () {
    expect(function() {
      new Database('_invalid');
    }).to.throw(
      'Invalid database_id'
    );
  });

  it('query with Query object', function () {
    let q = new Query(Note);
    return db.query(q).then(function (records) {
      expect(records.length).to.be.equal(2);
      expect(records[0]).to.be.an.instanceof(Note);
    }, function (error) {
      throw Error();
    });
  });

  it('save record to remote', function () {
    let r = new Note();
    return db.save(r).then(function (record) {
      expect(record).to.be.an.instanceof(Note);
    }, function (error) {
      throw Error();
    });
  });

  it('delete record at remote', function() {
    let r = new Note();
    return db.del(r).then(function () {
      return;
    }, function (error) {
      throw Error();
    });
  })

});