// see: https://stackoverflow.com/questions/21203111/bootstrap-3-collapsed-menu-doesnt-close-on-click
$(document).on('click', '.navbar-collapse.in', function(e) {
    if ($(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle') {
        $(this).collapse('hide');
    }
});

//Due to how HTML5 defines its semantics, the autofocus HTML attribute has no effect in Bootstrap modals.
$('#myModal').on('shown.bs.modal', function() {
    $('#myInput').focus()
})

var model = {
    catList: [],
    currentCat: null,
    catPics: ["cat1.jpg", "cat2.jpg", "cat3.jpeg", "cat4.jpg", "cat5.jpeg", ],

    init: function() {
        // generate all the cats
        for (var i = 0; i < this.catPics.length; i++) {
            this.catList.push(this.makeCat({
                imgUrl: 'static/img/' + this.catPics[i]
            }));
            // console.log(this.catList[i]);
        };

        // init the current cat
        this.currentCat = this.catList[0];
    },

    makeCat: function(spec) {
        var that = {};

        // private instance variables
        var name = spec.name || chance.name();
        var imgUrl = spec.imgUrl || '';
        var count = 0;

        // declare the public interface
        var inc_count = function() {
            count = count + 1;
        };

        var get_count = function() {
            return count;
        };

        var set_count = function(n) {
            count = n;
        };

        that.inc_count = inc_count;
        that.get_count = get_count;
        that.set_count = set_count;

        // private variables made public
        // obj not secure
        that.name = name;
        that.imgUrl = imgUrl;

        return that;
    }

};

var controller = {
    init: function() {
        model.init();
        listView.init();
        catView.init();
        formView.init();
    },

    getCurrentCat: function() {
        return model.currentCat;
    },

    setCurrentCat: function(cat) {
        model.currentCat = cat;
    },

    getCatList: function() {
        return model.catList;
    },

    updateCat: function(i, updated) {
        //console.log(i);

        model.catList[i].name = updated.name;
        model.catList[i].imgUrl = updated.imgUrl;
        model.catList[i].set_count(updated.count);

        listView.render();
        catView.render();
    }
};

var listView = {
    init: function(argument) {
        this.render()
    },

    render: function(argument) {

        this.$list = $('#list').html('')

        var cats = controller.getCatList();

        for (var i = 0; i < cats.length; i++) {

            // create new list item
            var $listItem = $('<li>')
                .addClass('list-group-item')
                .html(cats[i].name);

            var $span = $('<span>')
                .addClass('badge')
                .html(cats[i].get_count());

            $listItem.append($span);

            // add event
            $listItem.on('click', (function(cat, i) {

                return function(e) {
                    controller.setCurrentCat(cat); // store the current cat index
                    catView.render();
                    $('#catName').attr('catIndex', i);
                    //console.log(cat.get_count());
                };

            })(cats[i], i)); // use IIFE to bind a cat with a list item
            // return a function with with the bound data

            this.$list.append($listItem);
        };
    }
};


var catView = {
    // 'this' is the current object

    init: function() {
        var cat = controller.getCurrentCat();

        // the images
        this.$image = $('img:eq(1)');
        this.$image.attr('src', cat.imgUrl);

        // the cats name
        this.$name = $('#name').text(cat.name);
        // click count for this current cat
        this.$count = $('#count').text(cat.get_count());

        this.$image.on('click', function(e) {
            // inc the count and display
            controller.getCurrentCat().inc_count();
            catView.render();
            listView.init();
        });

        // display for edit form with correct values
        $('#myModal').on('show.bs.modal', function(e) {
            var cat = controller.getCurrentCat();
            $('#catName').val(cat.name);
            $('#imageUrl').val(cat.imgUrl);
            $('#clickCount').val(cat.get_count());
        });
    },

    render: function() {
        var cat = controller.getCurrentCat();
        var count = cat.get_count();

        this.$image.attr('src', cat.imgUrl);
        this.$name.text(cat.name);
        this.$count.text(cat.get_count());
    }
};

var formView = {
    init: function() {
        // http://twitterbootstrap.org/bootstrap-form-validation
        // http://jqueryvalidation.org/

        // setup form validation
        var validator = $("form").validate({
            rules: {
                debug: true,

                catName: {
                    required: true,
                    required: true
                },

                imageUrl: {
                    minlength: 6,
                    required: true
                },

                clickCount: {
                    required: true,
                    min: 0,
                    digits: true
                }

            },
            highlight: function(element) {
                $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            },
            success: function(element) {
                element
                    .text('OK!').addClass('valid')
                    .closest('.form-group').removeClass('has-error').addClass('has-success');
            },

        });

        $('.saveChanges').on('click', function(e) {
            var form = $('form');

            if (form.valid()) {
                // fetch the data in the input fields
                var name = $('#catName').val();
                var index = $('#catName').attr('data-catIndex');
                var imgUrl = $('#imageUrl').val();
                var count = +$('#clickCount').val();

                // store the new data in the cat
                controller.updateCat(index, {
                    name: name,
                    imgUrl: imgUrl,
                    count: count
                });

                //console.log(index, '\t', name, '\t', imgUrl, '\t', count);

                $('#myModal').modal('hide');

                // reset the form fields
                listView.render();
                catView.render();
            };
        });
    },
}

// make it all go
controller.init();
