process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const fs = require('fs');
const crypto = require('crypto');
const testFunctions = require('./testFunctions');

const { expect } = chai;

chai.use(chaiHTTP);


testFunctions.deleteFolders();
const server = require('../app');

describe('Server Errors', () => {
  it('Should respond with 404', (done) => {
    chai.request(server)
      .post('/notExistingPath')
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
  it('Should not allow empty post request', (done) => {
    chai.request(server)
      .post('/upload')
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it('Should not allow wrong upload field', (done) => {
    chai.request(server)
      .post('/upload')
      .attach('wrongField', fs.readFileSync('test/test_files/wrongFile.xml'), 'wrongFile.xml')
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it('Should not allow empty download query params', (done) => {
    chai.request(server)
      .get('/download')
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

describe('File Restrictions', () => {
  it('Should not allow wrong File format', (done) => {
    chai.request(server)
      .post('/upload')
      .attach('fileUpload', fs.readFileSync('test/test_files/wrongFile.xml'), 'wrongFile.xml')
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it('Should not exceed Max Filesize', (done) => {
    chai.request(server)
      .post('/upload')
      .attach('fileUpload', fs.readFileSync('test/test_files/20MB_Picture.jpg'), '20MB_Picture.jpg')
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it('Should not allow more than 8 files', (done) => {
    chai.request(server)
      .post('/upload')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto1.jpg')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto2.jpg')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto3.jpg')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto4.jpg')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto5.jpg')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto6.jpg')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto7.jpg')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto8.jpg')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto9.jpg')
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

describe('JPEG Compression', () => {
  let downloadLink = '';
  it('Should Compress JPEG', (done) => {
    chai.request(server)
      .post('/upload')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), '/testPhoto.jpg')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('zipMD5');
        expect(res.body.compressedImages).to.be.a('array');
        expect(res.body.compressedImages[0]).to.have.property('downloadLink');
        downloadLink = res.body.compressedImages[0].downloadLink;
        done();
      });
  }).timeout(5000);
  it('Should Download JPEG', (done) => {
    chai.request(server)
      .get(downloadLink)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.have.header('Content-Type', 'image/jpeg');
        done();
      });
  });
});

describe('PNG Compression', () => {
  let downloadLink = '';
  it('Should Compress PNG', (done) => {
    chai.request(server)
      .post('/upload')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.png'), 'testPhoto.png')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('zipMD5');
        expect(res.body.compressedImages).to.be.a('array');
        expect(res.body.compressedImages[0]).to.have.property('downloadLink');
        downloadLink = res.body.compressedImages[0].downloadLink;
        done();
      });
  }).timeout(10000);
  it('Should Download PNG', (done) => {
    chai.request(server)
      .get(downloadLink)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.have.header('Content-Type', 'image/png');
        done();
      });
  });
});

describe('Multifile Support', () => {
  let downloadLink;
  let origMD5;
  it('Should Allow 8 Mixed Pictures', (done) => {
    chai.request(server)
      .post('/upload')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto1.jpg')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.png'), 'testPhoto2.png')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto3.jpg')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.png'), 'testPhoto4.png')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto5.jpg')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.png'), 'testPhoto6.png')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.jpg'), 'testPhoto7.jpg')
      .attach('fileUpload', fs.readFileSync('test/test_files/testPhoto.png'), 'testPhoto8.png')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('zipMD5');
        expect(res.body.compressedImages).to.be.a('array');
        expect(res.body.compressedImages).to.have.length(8);
        downloadLink = res.body.zipDownloadLink;
        origMD5 = res.body.zipMD5;
        done();
      });
  }).timeout(25000);
  it('Should Download Zip Folder', (done) => {
    chai.request(server)
      .get(downloadLink)
      .parse(testFunctions.binaryParser)
      .buffer()
      .end((err, res) => {
        expect(res).to.have.status(200);
        const md5Hash = crypto.createHash('md5')
          .update(res.body)
          .digest('hex');
        expect(md5Hash).to.be.equal(origMD5);
        done();
      });
  });
});
