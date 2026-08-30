(function($) {
    'use strict';

	var imageMapGallery = {};
	mkdf.modules.imageMapGallery = imageMapGallery;

	imageMapGallery.mkdfInitImageMapGallery = mkdfInitImageMapGallery;


	imageMapGallery.mkdfOnWindowLoad = mkdfOnWindowLoad;

	$(window).on('load', mkdfOnWindowLoad);

	/*
	 ** All functions to be called on $(window).on('load', ) should be in this function
	 */
	function mkdfOnWindowLoad() {
        mkdfInitImageMapGallery();
	}

	/*
	 ** Init Image Gallery shortcode - Masonry layout
	 */
	function mkdfInitImageMapGallery() {

        var holder = $('.mkdf-image-map-gallery');

        holder.each(function () {

            var thisHolder = $(this);

            var imageMapName =  thisHolder.data('image-map-name');
            var lastHighlight;
            var shapeName;

            var navigationActive = thisHolder.find('.mkdf-map-nav-item.mkdf-active-map');
            var navigation = thisHolder.find('.mkdf-map-nav-item.mkdf-inactive-map');
            var mappedImage = thisHolder.find('.mkdf-image-map-holder-overlay');
            var imageHolder = thisHolder.find('.mkdf-image-map-holder');

            navigation.each(function(){
                $(this).on('click', function(){
                    mappedImage.css('z-index', 999);
                    imageHolder.css('opacity', 0.5);
                })
            });

            navigationActive.each(function(){
                $(this).on('click', function(){
                    mappedImage.css('z-index', -1);
                    imageHolder.css('opacity', 1);
                })
            });

            // reference for main items
            var slider = thisHolder.find('.mkdf-img-slider');
            // reference for thumbnail items
            var thumbnailSlider = thisHolder.find('.mkdf-pagination-slider');
            //transition time in ms
            var duration = 500;


            // carousel function for main slider
            slider.owlCarousel({
                loop:false,
                nav:false,
                items:1,
                onInitialized: function () {
                    slider.css('visibility', 'visible');
                },
                onChange: function(e) {
                    setTimeout(function(){
                        shapeName = slider.find('.owl-item.active .mkdf-ig-image').data('imp-shape');
                        if(typeof shapeName !== 'undefined') {
                            imageMapHighlight();
                        }
                    }, 300);

                    //On change of main item to trigger thumbnail item
                    thumbnailSlider.trigger('to.owl.carousel', [e.item.index, duration, true]);
                }
            });


            // carousel function for thumbnail slider
            thumbnailSlider.owlCarousel({
                loop:false,
                nav:false,
                dots: false,
                items:5,
                margin: 15,
                responsive:{
                    0:{
                        items:3
                    },
                    1025:{
                        items:5,
                    }
                },
                onInitialize: function () {
                    thumbnailSlider.css('visibility', 'visible');
                },
            }).on('click', '.owl-item', function () {
                // On click of thumbnail items to trigger same main item
                slider.trigger('to.owl.carousel', [$(this).index(), duration, true]);

            }).on('changed.owl.carousel', function (e) {
                // On change of thumbnail item to trigger main item
                slider.trigger('to.owl.carousel', [e.item.index, duration, true]);
            });


            //These two are navigation for main items
            $('.slider-right').on('click', function() {
                slider.trigger('next.owl.carousel');
            });
            $('.slider-left').on('click', function() {
                slider.trigger('prev.owl.carousel');
            });

            function imageMapHighlight(){
                if(typeof lastHighlight !== 'undefined') {
                    $.imageMapProUnhighlightShape(imageMapName, lastHighlight);
                }
                if(shapeName !== 'empty'){
                    $.imageMapProHighlightShape(imageMapName, shapeName);
                    lastHighlight = shapeName;
                }
            }

            var singleSection = thisHolder.find('.mkdf-img-section'),
                singleNav  = thisHolder.find('.mkdf-map-navigation .mkdf-map-nav-item');

            singleNav.on('click', function() {
                singleSection.removeClass('active');
                singleNav.removeClass('active');
                var thisNav= $(this),
                    index = thisNav.index();
                thisNav.addClass('active');
                singleSection.eq(index).addClass('active');
            });

        });
    }

    $.imageMapProEventClickedShape = function(imageMapName, shapeName){
        var sliderIndex = -1;
        var impObject = $(".mkdf-image-map-gallery[data-image-map-name='" + imageMapName + "']");
        // reference for main items
        var slider = impObject.find('.mkdf-img-slider');
        // reference for thumbnail items
        var thumbnailSlider = impObject.find('.mkdf-pagination-slider');
        // find slider items
        var sliderItems = slider.find('.owl-item .mkdf-ig-image');
        sliderItems.each(function(){
            if($(this).data('imp-shape') === shapeName){
                sliderIndex = $(this).parent().index();
            }
            if(sliderIndex !== -1){
                slider.trigger('to.owl.carousel', [sliderIndex, 500, true]);
                thumbnailSlider.trigger('to.owl.carousel', [sliderIndex, 500, true]);
            }
        })

    };

})(jQuery);


