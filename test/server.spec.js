process.env.NODE_ENV = "test";

const server = require("../app"),
    chai = require("chai"),
    chaiHTTP = require("chai-http"),
    fs = require("fs"),
    should = chai.should()

chai.use(chaiHTTP);

describe("File Restrictions", () => {
    let downloadLink = "";
    it("Should not allow empty post request", (done) => {
        chai.request(server)
            .post("/upload")
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })
    })
    it("Should not allow wrong File format", (done) => {
        chai.request(server)
            .post("/upload")
            .attach("fileUpload", fs.readFileSync('test/test_files/wrongFile.xml'), 'wrongFile.xml')
            .end((err, res) => {
                res.should.have.status(400);
                done()
            })
    })
    it("Should not exceed Max Filesize", (done) => {
        chai.request(server)
            .post("/upload")
            .attach("fileUpload", fs.readFileSync('test/test_files/20MB_Picture.jpg'), '20MB_Picture.jpg')
            .end((err, res) => {
                res.should.have.status(400);
                done()
            })
    })
})
describe("JPEG Compression", () => {
    let downloadLink = "";
    it("Should Compress JPEG", (done) => {
        chai.request(server)
            .post("/upload")
            .attach("fileUpload", fs.readFileSync('test/test_files/patrick-tomasso.jpg'), 'patrick-tomasso.jpg')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property("downloadLink");
                downloadLink = res.body.downloadLink;
                done();
            })
    }).timeout(5000);
    it("Should Download JPEG", (done) => {
        chai.request(server)
            .get(downloadLink)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.have.header("Content-Type", "image/jpeg");
                done();
            })
    })
})
describe("PNG Compression", () => {
    let downloadLink = "";
    it("Should Compress PNG", (done) => {
        chai.request(server)
            .post("/upload")
            .attach("fileUpload", fs.readFileSync('test/test_files/patrick-tomasso.png'), 'patrick-tomasso.png')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property("downloadLink");
                downloadLink = res.body.downloadLink;
                done();
            })
    }).timeout(10000);
    it("Should Download PNG", (done) => {
        chai.request(server)
            .get(downloadLink)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.have.header("Content-Type", "image/png");
                done();
            })
    })
})