/* A few simple tests */



var poll_stub = {
    "id": 1,
    "question": "I always wondered, have you ever answered a question?",
    "answers": [{
        "id": 1,
        "value": "Yes",
        "count": 10,
        "percent": 0
    }, {
        "id": 2,
        "value": "No",
        "count": 20,
        "percent": 0
    }],
    "total": 0
};

var testPoll = new PollingWidget();


describe('PollingWidget', function() {
    describe('Constructor', function() {
        it('should initialize a default "id" property', function() {
            testPoll.should.have.property('id').and.should.not.be.null;
        });
        describe('Context object: "options"', function() {
            it('should always exist', function() {
                testPoll.should.have.property('options').and.should.not.be.null;
            });
            it('should initialize a default "el" property', function() {
                var options = testPoll.options;
                options.should.have.property('el').and.should.not.be.null;
            });

        });
    });
});

describe("DOM Tests", function () {

});

