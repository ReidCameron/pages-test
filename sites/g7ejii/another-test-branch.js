window.SearchSpringInit = function(){
// springboard generated variables
var modules = {};
modules.enabled = true;

// springboard generated variables for autocomplete/default
modules['autocomplete'] = {
	input: '.searchspring-ac',
	spellCorrection: false,
	language: 'en',
	action: '',
	autoPosition: false,
	limit: 4
};

this.importer.include('autocomplete2', modules.autocomplete);
this.importer.include('infinite');

this.on('afterBootstrap', function($scope) {
	$scope.$watch('ac.visible', function() {
		var bodySelector = angular.element(document.querySelectorAll('body'));
		var bodyAcClass = 'ss-ac-open';

		if ($scope.ac.visible) {
			bodySelector.addClass(bodyAcClass);
		} else {
			bodySelector.removeClass(bodyAcClass);
		} 
	});
});

var self = this;

// springboard generated variables   
var modules = {};
modules.enabled = true;

// this.on('afterSearch', function() {
// 	// this will hide the filter after an option is selected
// 	angular.element(document.querySelector('.collection-nav-block.filters')).removeClass('opened');
// });


this.on('afterSearch', function($scope) {
	// Check if there is more than one page (for head title logic)
	$scope.multiplePages = true;
	if ($scope.pagination.totalResults <= $scope.pagination.perPage) {
		$scope.multiplePages = false;
	}
});

this.on('afterSearch', function($scope){
	// 
	// Adds options for pagination (for 'view xx' facet)
	var pagination = $scope.pagination, 
		results = $scope.results;

    if (!pagination.options) {
      pagination.options = [{
		label: '20',
        value: 20
      }, {
        label: '60',
        value: 60
      }, {
        label: 'all',
        value: 'infinite'
      }, ].map(function(option) {
        var value = option.value;

        option.go = function(infiniteOverride) {
		  if(infiniteOverride != null){
			var reset = ($scope.isInfiniteEnabled && !infiniteOverride);
			$scope.isInfiniteEnabled = infiniteOverride;
		  }
          pagination.selected = option
          if (typeof value === 'string' && value === 'infinite') {
            pagination.isInfiniteEnabled = true;
			Object.assign($scope.infinite, $scope.infinite_old)
          } else if (typeof value === 'number' && value > 0) {
            pagination.isInfiniteEnabled = false;
            pagination.perPage = value
          }
		  if(reset){

			$scope.results.splice(pagination.perPage)
			$scope.infinite_old = Object.assign({}, $scope.infinite)
			$scope.infinite = {}
		  }
        }

        return option;
      });

    }

    if (!pagination.selected) {
      var currentOption = pagination.options.find(function(option) {
        return option.value === pagination.perPage
      }) || pagination.options[0];

      currentOption.go(null)
    }
})


// background filtering for collection pages
if (self.context.collection) {
    // set background filter   
    self.context.backgroundFilters['collection_id'] = self.context.collection;
     
    // handle collection tags (filters)
    var tags = self.context.tags;
    if (tags) {
        tags = tags.toLowerCase().replace(/-/g, '').replace(/ +/g, '').split('|');
        self.context.backgroundFilters.ss_tags = tags;
    }
}

if (self.context.collection) {
	self.context.backgroundFilters['ss_visibility'] = "Collection";
} else {
	self.context.backgroundFilters['ss_visibility'] = "Search";
}

this.on('afterSearch', function($scope) {
	angular.forEach($scope.results, function(result, index) {
		var isResultFirstLoad = checkResult(index, $scope.pagination, $scope.results.length);
		
		if(isResultFirstLoad) {
			result.swym_url = result.url;	
		}
	})
})

this.on('afterSearch', function($scope) {
		angular.forEach($scope.results, function(result, index) {
			var isResultFirstLoad = checkResult(index, $scope.pagination, $scope.results.length);
			
			if(isResultFirstLoad) {
				if (result.price % 1 === 0) {
					result.priceInteger = true;
				}	
			}
		});
		
		angular.forEach($scope.results, function(result, index) {
			var isResultFirstLoad = checkResult(index, $scope.pagination, $scope.results.length);
			
			if(isResultFirstLoad) {
				if (result.msrp % 1 === 0) {
					result.msrpInteger = true;
				}	
			}
		});
});

this.on('afterSearch', function($scope) {
    // if on collection page
    if (self.context && self.context.collection) {
        angular.forEach($scope.results, function(result, index) {
            var isResultFirstLoad = checkResult(index, $scope.pagination, $scope.results.length);

            if (isResultFirstLoad) {
                if (result.images && result.images.length) {

                    var imgsArr = result.ss_images.split(',')

                    if (self.context && self.context.genderOthers) {
                        var gender_others = self.context.genderOthers.split(',')
                    }
                    var finalImgsArr = []

                    // find 1st & 2nd images that don't contain self.context.gender-others and set as main and alt imgs
                    if (self.context && self.context.gender && (self.context.gender.toLowerCase() == 'women' || self.context.gender == '')) {
                        result.url = result.url + '?vw=women'

                        var removeImgs = []
                        var tempStr = result.ss_images

                        for (var i = 0; i < imgsArr.length; i++) {
                            for (var j = 0; j < gender_others.length; j++)
                                if (imgsArr[i].indexOf('__' + gender_others[j]) != -1) {
                                    removeImgs.push(imgsArr[i])
                                }
                        }

                        if (removeImgs.length > 0) {
                            for (var k = 0; k < removeImgs.length; k++) {
                                tempStr = tempStr.replace(removeImgs[k], '').replace(/\|+/, '|')
                            }
                        }
                        tempStr = tempStr.split(',')

                        for (var l = 0; l < tempStr.length; l++) {
                            if (tempStr[l] != '' && tempStr[l].toLowerCase().indexOf('_swatch') == -1) {
                                finalImgsArr.push(tempStr[l])
                            }
                        }
                    } else if (self.context && self.context.gender && (self.context.gender.toLowerCase() != 'women')) {
                        result.url = result.url + '?vw=' + self.context.gender

                        for (var i = 0; i < imgsArr.length; i++) {
                            if (imgsArr[i].indexOf('__' + self.context.gender) != -1) {
                                finalImgsArr.push(imgsArr[i])
                            }
                        }
                    }
                    result.thumbnailImageUrl = finalImgsArr[0]
                    result.ss_image_alt = finalImgsArr[1]
                }
            }

        })
    }
})

// Function for adding wishlist data
function wishlistData(result) {
	// Set retail
	var newRetail = ((result.msrp && result.msrp > 0) ? (result.msrp * 1) : '');

	// Set other data variables
	var collections = '';
	var variants = [], currentVariant, variantPrice = (result.price * 1), variantOp = newRetail, stk, purl = ("https:" + result.swym_url), empi = (result.uid * 1), piu = result.imageUrl;

	// Add details from first variant
	currentVariant = result.ss_id;
	var variantDetails = {};
	variantDetails[result.name] = result.ss_id;
	variants.push(variantDetails);
	variantPrice = (result.price * 1),
	variantOp = newRetail;
	if (result.variant_inventory_quantity) {
		stk = (result.variant_inventory_quantity.split("|")[0] * 1);	
	}

	if (result.variants) {
		var parsedVariants = JSON.parse(result.variants);
	}


	var o = {};
	if (parsedVariants && parsedVariants.length > 0) {
		for (var i = 0; i < parsedVariants.length; i++) {
			var v = parsedVariants[i];

			var vDetails = {};
			vDetails[v.title] = v.id;
			if (!SwymProductVariants[v.id]) {
				SwymProductVariants[v.id] = {
					empi: empi,
					epi: (v.id * 1),
					du: "https:" + result.swym_url,
					iu: result.imageUrl,
					stk: (v.inventory_quantity * 1),
					pr: v.price * 1,
					op: ((v.compare_at_price && v.compare_at_price > 0) ? (v.compare_at_price * 1) : ''),
					variants: [vDetails]
				};				
			}

			SwymWatchProducts[v.id] = o[v.id] = {
				'id': v.id,
				'inventory_management': v.inventory_management,
				'inventory_quantity': v.inventory_quantity,
				'title': v.title,
				'inventory_policy': v.inventory_policy
			};
		}
	}
	if (!SwymWatchProducts[result.handle]) {
		SwymWatchProducts[result.handle] = SwymWatchProducts[result.uid] = o;	
	}
	
	var product_data = {
		empi: empi,
		epi: (currentVariant * 1),
		dt: result.name,
		du: purl,
		ct: collections,
		pr: variantPrice,
		stk: stk,
		iu: piu,
		variants: variants,
		op: variantOp
	};
	if (!SwymViewProducts[result.handle]) {
		SwymViewProducts[result.handle] = SwymViewProducts[result.uid] = product_data;
	}
	
}

this.on('domReady', function() {
	function swymCallbackFn(swat) {
		swat.initializeActionButtons(".collection-products"); 
	}
	if(!window.SwymCallbacks) {
		window.SwymCallbacks = [];
	}
	window.SwymCallbacks.push(swymCallbackFn);
})


this.on('afterSearch', function($scope) {
	angular.forEach($scope.results, function(result, index) {
		
		var isResultFirstLoad = checkResult(index, $scope.pagination, $scope.results.length);
		
		if(isResultFirstLoad){
			// Functionality for wishlist
			if (!$scope.moduleName || $scope.moduleName == 'widget') {
				if (!window.SwymViewProducts) {
					window.SwymViewProducts = {};
				}
				if (!window.SwymWatchProducts) {
					window.SwymWatchProducts = {};
				}
				if (!window.SwymProductVariants) {
					window.SwymProductVariants = {};
				}
				
				wishlistData(result);
			}	
		}
	})
})

this.on('afterSearch', function($scope) {
		angular.forEach($scope.results, function(result, index) {
			var isResultFirstLoad = checkResult(index, $scope.pagination, $scope.results.length);
			if(isResultFirstLoad) {
				if (result.variant_color) {
					result.ariaLabel = result.name + ", color: " + result.variant_color;
				} else {
					result.ariaLabel = result.name;
				}	
			}
		});
})

this.on('afterBootstrap', function($scope) {
	$scope.utilities = $scope.utilities || {};

	// Helper function to find ancestors / parents... e = element, c = class
	if ($scope.utilities) {
		$scope.utilities.findAncestor = function(e, c) {
			while (e) { if (e.className && e.className.indexOf(c) !== -1) { return e; } e = e.parentNode; } return null;
		};

		// Dropdown object with toggle functionality
		$scope.utilities.dropdown = {
			expandedClass : 'ss-expanded',
			dropdownClass : 'ss-dropdown-menu',
			removeClasses : function() {
				angular.element(document.querySelectorAll('.' + this.dropdownClass + '.' + this.expandedClass)).removeClass(this.expandedClass);
			},
			show : function(e) {
				e.stopPropagation();
				var dropdownMenu = angular.element($scope.utilities.findAncestor((e.target || e.srcElement), this.dropdownClass));
				if (dropdownMenu.hasClass(this.expandedClass)) {
					this.removeClasses();
				} else {
					this.removeClasses();
					dropdownMenu.addClass(this.expandedClass);
				}
			}
		};

		// Close elements if clicked outside
		angular.element(document).on('click', function() {
			$scope.utilities.dropdown.removeClasses();
		});
	}
});

this.importer.include('slideout', modules.slideout);

// check if on mobile
this.on('afterSearch', function($scope) {
    if (!$scope.moduleName) {
        if ($scope.slideout.triggered) {
            $scope.isMobile = true
        } else {
            $scope.isMobile = false
        }
    }
});

this.on('afterSearch', function($scope) {
		angular.forEach($scope.results, function(result, index) {
			var isResultFirstLoad = checkResult(index, $scope.pagination, $scope.results.length);
			
			if(isResultFirstLoad) {
				result.badge = "";
				if(result.tags.indexOf('sale-badge') > -1){
					result.badge = "SALE"
				} else if(result.ss_available * 1 == 0 && result.tags.indexOf('pre-order') > -1){
					result.badge = "PRE ORDER"
				} else if(result.tags.indexOf('new-arrivals') > -1){
					result.badge = "NEW ARRIVALS"
				} else if(result.tags.indexOf('best-seller') > -1){
					result.badge = "BEST SELLER"
				}	
			}
		});
});

// Check if result has already updated details (mostly for infinite scroll)
function checkResult(index, pagination, resultsLength) {
	var offSetIndex = index + 1;
	var weights = false;
	
	if (!pagination.isInfiniteEnabled && pagination && (resultsLength > pagination.perPage) && pagination.currentPage > 1) {
	  weights = false;
	
	  if (offSetIndex >= pagination.begin) {
	    weights = true;
	  }
	} else {
	  weights = true;
	}
	
	return weights;
}

}
SearchSpring.Catalog.templates.promises.receive.resolve('<!--!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! DO NOT TOUCH TEMPLATES WITHOUT FIRST TESTING ON THEIR DEV SITE AND GETTINGCUSTOMER APPROVAL OF THE CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!--><link rel=\"stylesheet\" href=\"//cdn.searchspring.net/ajax_search/sites/g7ejii/css/g7ejii.css\" /><!-- AutoComplete --><script type=\"text/template\" name=\"AutoComplete\" target=\"[ss-autocomplete]\"><div class=\"ss-ac-container\" ng-show=\"ac.visible\" ng-class=\"{\'no-terms\': ac.terms.length == 0}\"><div class=\"ss-ac-terms\" ng-show=\"ac.terms\"><h4 class=\"ss-title ss-ac-terms-title\">Suggestions</h4><div class=\"ss-list\"><div ng-repeat=\"term in ac.terms | limitTo:4\" class=\"ss-list-option\" ng-class=\"{\'ss-active\': term.active}\"><a ng-bind-html=\"term.label | trusted\" ss-no-ps ss-nav-selectable ng-focus=\"term.preview()\" href=\"{{ term.url }}\" class=\"ss-list-link\"></a></div></div></div><div class=\"ss-ac-results\"><h4 class=\"ss-title ss-ac-results-title\">Related Items</h4><div ng-if=\"ac.merchandising.content.header.length > 0\" id=\"ss-ac-merch-header\" class=\"ss-ac-merchandising\" ss-merchandising=\"ac.header\"></div><div ng-if=\"ac.merchandising.content.banner.length > 0\" id=\"ss-ac-merch-banner\" class=\"ss-ac-merchandising\" ss-merchandising=\"ac.banner\"></div><div ng-if=\"ac.results.length\" class=\"ss-ac-item-container ss-flex-wrap\"><article class=\"ss-ac-item\" ng-repeat=\"result in ac.results | limitTo:ac.pagination.perPage\"><a ng-href=\"{{ result.url }}\" ss-no-ps ss-nav-selectable><div class=\"ss-ac-item-image\"><divclass=\"ss-image-wrapper\"ng-style=\"{\'background-image\': \'url(\' + result.thumbnailImageUrl + \')\'}\"alt=\"{{ result.name }}\"title=\"{{ result.name }}\"></div></div><div class=\"ss-ac-item-details\"><p class=\"ss-ac-item-name\">{{ result.name | truncate:40:\'&hellip;\' }}</p></div></a></article></div><div ng-if=\"!ac.results.length\" class=\"ss-ac-no-results\"><p>No results found for \"{{ ac.q }}\". Please try another search.</p></div><div ng-if=\"ac.merchandising.content.footer.length > 0\" id=\"ss-ac-merch-footer\" class=\"ss-ac-merchandising\" ss-merchandising=\"ac.footer\"></div></div></div></script><!-- Horizontal Facets --><script type=\"text/template\" name=\"Horizontal Facets\" target=\".ss-facets-horizontal\"><div ng-if=\"pagination.totalResults\" class=\"nav\"><div class=\"collection-nav-block filters ss-nav\"><button type=\"button\" class=\"nav-title ae-button ss-nav-title\">Filter<span ng-if=\"filterSummary.length\">({{ filterSummary.length }})</span></button><div class=\"nav-content\"><div class=\"nav-action-container\"><buttonng-if=\"filterSummary.length\"class=\"clear-all clear-all-filters filter-swatch ae-button\"ng-click=\"location().remove(\'filter\').remove(\'rq\').go()\">Clear All</button><button type=\"button\" class=\"nav-apply ae-button ss-nav-close\"><span class=\"visually-hidden\">Close</span></button></div><div class=\"nav-list-container ss-nav-list-container ss-facets-options\"></div></div></div></div><div ng-if=\"pagination.totalResults\" class=\"tools\"><div class=\"collection-nav-block sorting nav-dropdown ss-nav ss-nav-dropdown\"><button type=\"button\" class=\"nav-title ae-button ss-nav-title\">Sort</button><div class=\"nav-content nav-dropdown-content ss-nav-dropdown-content\"><div class=\"nav-list-container ss-nav-list-container\"><buttonng-repeat=\"option in sorting.options\"type=\"button\"class=\"filter ae-button ss-filter-button\"ng-class=\"{\'active\': option.label == sorting.current.label}\"ng-click=\"option.go()\"><span ng-class=\"{\'ss-active-sort-option\': option.label == sorting.current.label}\">{{ option.label }}</span></button></div></div></div></div><div ng-if=\"pagination.totalResults\" class=\"tools\"><div class=\"collection-nav-block pagination nav-dropdown ss-nav ss-nav-dropdown\"><button type=\"button\" class=\"nav-title ae-button ss-nav-title\">View {{ pagination.selected.label }}</button><div class=\"nav-content nav-dropdown-content ss-nav-dropdown-content\"><div class=\"nav-list-container ss-nav-list-container\"><buttonng-repeat=\"option in pagination.options\"type=\"button\"class=\"filter ae-button ss-filter-button\"ng-class=\"{\'active\': option.label == pagination.selected.label}\"ng-click=\"option.go(option.value === \'infinite\');\"><span ng-class=\"{\'ss-active-pagination-option\': option.label === pagination.selected.label}\">View {{ option.label }}</span></button></div></div></div></div></script><!-- Desktop - Facets --><script type=\"text/template\" name=\"Desktop - Facets\" target=\".ss-facets-horizontal .ss-facets-options\"><divng-if=\"facets.length\"ng-repeat=\"facet in facets\"ng-switch=\"facet.type\"ng-if=\"(facet.type == \'hierarchy\' ? facet.values.length : true)\"id=\"ss-{{ facet.field }}\"class=\"filter nav-dropdown ss-facet-container ss-facet-container-{{ facet.type ? facet.type : \'list\' }} {{ facet.collapse == 0 ? \'closed\' : \'opened\' }}\"><button type=\"button\" class=\"nav-dropdown-title ae-button ss-nav-title\" ng-click=\"facet.collapse = facet.collapse == 0 ? 1 : 0\">{{ facet.label }}</button><div ng-switch-default class=\"filter-swatches nav-dropdown-content ss-nav-dropdown-content\"><button type=\"button\" class=\"filter-swatch view-all ae-button\"><span>View All</span></button><buttonng-repeat=\"value in facet.values\"class=\"filter-swatch ae-button ss-filter-button\"ng-class=\"{\'active\': value.active}\"ng-click=\"value.go()\"><span>{{ value.label }}</span></button></div></div></script><script type=\"text/template\" name=\"Search Page - Search Bar\" target=\".searchspring-searchbar\"><div class=\"search-results-banner\" ng-class=\"{\'no-result\' : pagination.totalResults === 0}\"><form action=\"/search\" method=\"get\" role=\"search\" class=\"search-form\"><input type=\"search\" name=\"q\" class=\"ss-results-search\" value=\"\" placeholder=\"Search\" /><input type=\"hidden\" name=\"view\" value=\"spring\" /><button type=\"submit\" class=\"btn\"><span class=\"icon-fallback-text\">Search</span></button></form><div ng-if=\"pagination.totalResults === 0\" class=\"searched-preformed-wrapper\"><h2 class=\"search-results-description\">Your search - {{ q }} - did not match any products</h2><p class=\"search-results-suggestion\">Please try using a broader term and search again.</p></div></div></script><!-- Pagination --><!-- <script type=\"text/template\" name=\"Results - Pagination\" target=\"#searchspring-content .collection-pagination\"><a ng-if=\"pagination.previous\" ng-href=\"{{ pagination.previous.url }}\" class=\"prev-link\"><span class=\"icon\" aria-hidden=\"true\"></span><span class=\"text\">Previous</span></a><span ng-if=\"pagination.totalPages > 3 && pagination.currentPage > 2\" class=\"page\"><a ng-href=\"{{ pagination.first.url }}\">{{ pagination.first.number }}</a></span><span ng-if=\"pagination.totalPages > 3 && pagination.currentPage > 2\" class=\"deco\">...</span><span ng-repeat=\"page in pagination.getPages(3)\" class=\"page\" ng-class=\"{\'current\': page.active}\"><a ng-if=\"!page.active\" ng-href=\"{{ page.url }}\">{{ page.number }}</a><span ng-if=\"page.active\">{{ page.number }}</span></span><span ng-if=\"pagination.totalPages > 3 && pagination.currentPage < (pagination.totalPages - 1)\" class=\"deco\">...</span><span ng-if=\"pagination.totalPages > 3 && pagination.currentPage < (pagination.totalPages - 1)\" class=\"page\"><a ng-href=\"{{ pagination.last.url }}\">{{ pagination.last.number }}</a></span><a ng-if=\"pagination.next\" ng-href=\"{{ pagination.next.url }}\" class=\"next-link\"><span class=\"icon\" aria-hidden=\"true\"></span><span class=\"text\">Next</span></a></script> --><!-- Results & No Results --><script type=\"text/template\" name=\"Results &amp; No Results\" module=\"search\" target=\"#searchspring-content\"><div class=\"collection-listing-wrapper\"><div class=\"ss-header-container\"><div ng-if=\"merchandising.content.header.length > 0\" id=\"ss-merch-header\" class=\"ss-merchandising\" ss-merchandising=\"header\"></div></div><div class=\"ss-filter-container\"><div ng-if=\"filterSummary.length\" class=\"ss-summary\"></div></div><div ng-if=\"pagination.totalResults\" class=\"ss-results\"><div class=\"ss-toolbar ss-toolbar-top\"></div><div ng-if=\"merchandising.content.banner.length > 0\" id=\"ss-merch-banner\" class=\"ss-merchandising\" ss-merchandising=\"banner\"></div><div ng-if=\"isInfiniteEnabled\" class=\"collection-products items ss-item-container ss-item-container-grid\" infinite></div><div ng-if=\"!isInfiniteEnabled\" class=\"collection-products items ss-item-container ss-item-container-grid\"></div><div ng-show=\"infinite.loading\" class=\"ss-infinite-loading\"></div><div ng-if=\"merchandising.content.footer.length > 0\" id=\"ss-merch-footer\" class=\"ss-merchandising\" ss-merchandising=\"footer\"></div></div></div><divng-if=\"pagination.totalPages > 1 && !isInfiniteEnabled\"class=\"collection-pagination\"aria-label=\"Pagination\"role=\"navigation\"></div></script><!-- Results - Items --><script type=\"text/template\" name=\"Results - Items\" target=\".ss-results .ss-item-container\"><article ng-repeat=\"result in results track by result.uid\" class=\"item\"><div class=\"product-image-wrapper\"><aclass=\"product-link alt-image-ready\"ng-href=\"{{ result.url }}\"aria-label=\"{{result.ariaLabel}}\"data-accessible-title=\"{{result.ariaLabel}}\"intellisuggest><imgclass=\"product-image ae-img\"ng-src=\"{{ result.thumbnailImageUrl ? result.thumbnailImageUrl : \'//cdn.shopify.com/s/assets/no-image-2048-5e88c1b20e087fb7bbe9a3771824e743c244f437e4f8ba93bbf7b11b53f7824c_700x.gif\' }}\"onerror=\"this.src=\'//cdn.shopify.com/s/assets/no-image-2048-5e88c1b20e087fb7bbe9a3771824e743c244f437e4f8ba93bbf7b11b53f7824c_700x.gif\';\"alt=\"{{ result.name }}\"title=\"{{ result.name }}\"/><img ng-if=\"result.ss_image_alt\" loading=\"lazy\" class=\"product-image alt ae-img\" ng-src=\"{{ result.ss_image_alt }}\" alt=\"{{ result.name }}\" /></a><div class=\"wishlist-btn-wrapper\"><buttondata-with-epi=\"true\"class=\"swym-button swym-add-to-wishlist-view-product product_{{ result.uid }}\"data-swaction=\"addToWishlist\"data-product-id=\"{{ result.uid }}\"data-variant-id=\"{{result.variant_id[0]}}\"data-product-url=\"https:{{ result.swym_url }}\"></button></div></div><div class=\"product-info-wrapper\"><div ng-if=\"result.badge\" class=\"product-preorder-badge\"><span>{{result.badge}}</span></div><div ng-if=\"result.tags.indexOf(\'badge:NK Exclusive\') > -1\" class=\"product-badge\"><span>NK Exclusive</span></div><div ng-if=\"result.tags.indexOf(\'badge:NK Exclusive\') > -1\" class=\"product-badge\"><span>Best Seller</span></div><p class=\"product-name\">{{ result.name }}</p><div class=\"price-box\" ng-class=\"{\'has-special\': result.variant_price.length <= 1 && (result.msrp && (result.msrp * 1) > (result.price * 1))}\"><span ng-if=\"result.variant_price.length > 1\" class=\"from-span\">FROM</span><spanng-if=\"result.variant_price.length <= 1 && (result.msrp && (result.msrp * 1) > (result.price * 1)) && !result.msrpInteger\"class=\"product-compare-price\">${{ result.msrp | number:2 }}</span><spanng-if=\"result.variant_price.length <= 1 && (result.msrp && (result.msrp * 1) > (result.price * 1)) && result.msrpInteger\"class=\"product-compare-price\">${{ result.msrp }}</span><span class=\"h2 product-price\" itemprop=\"price\" ng-if=\"!result.priceInteger\" content=\"${{ result.price }}\">${{ result.price | number:2 }}</span><span class=\"h2 product-price\" itemprop=\"price\" ng-if=\"result.priceInteger\" content=\"${{ result.price }}\">${{ result.price }}</span></div><a ng-if=\"result.ss_more_colors == 1\" ng-href=\"{{ result.url }}\" intellisuggest class=\"more-colors\">More Colors</a></div></article></script><!-- Desktop - Facets --><script type=\"text/template\" name=\"Desktop - Facets\" target=\".ss-facets-horizontal .ss-facets-options\"><divng-if=\"facets.length\"ng-repeat=\"facet in facets\"ng-switch=\"facet.type\"ng-if=\"(facet.type == \'hierarchy\' ? facet.values.length : true)\"id=\"ss-{{ facet.field }}\"class=\"filter nav-dropdown ss-facet-container ss-facet-container-{{ facet.type ? facet.type : \'list\' }} {{ facet.collapse == 0 ? \'closed\' : \'opened\' }}\"><button type=\"button\" class=\"nav-dropdown-title ae-button ss-nav-title\" ng-click=\"facet.collapse = facet.collapse == 0 ? 1 : 0\">{{ facet.label }}</button><div ng-switch-default class=\"filter-swatches nav-dropdown-content ss-nav-dropdown-content\"><button type=\"button\" class=\"filter-swatch view-all ae-button\"><span>View All</span></button><buttonng-repeat=\"value in facet.values\"class=\"filter-swatch ae-button ss-filter-button\"ng-class=\"{\'active\': value.active}\"ng-click=\"value.go()\"><span>{{ value.label }}</span></button></div></div></script><style name=\"Filter Redesign - 208347\"> /* Resets typography */.product-collection .nav-dropdown .nav-dropdown-title,.ss-filter-button span,.collection-nav-block.ss-nav .ss-nav-title,.product-collection.one-column .collection-nav-block.ss-nav.filters .nav-action-container .clear-all {text-align: center;font-family:NeueHaasGrotesk-Roman,Arial\\,HelveticaNeue,Helvetica Neue,Helvetica,sans-serif;font-size: 11px !important;font-style: normal;font-weight: 400;line-height: 20px;letter-spacing: 0.25em !important;text-transform: uppercase;white-space: nowrap;}.ss-nav.filters .nav-content .clear-all {font-weight: 400;}.ss-filter-button .ss-active-sort-option,.ss-filter-button .ss-active-pagination-option {font-weight: 450;}/* Nav Dropdowns */.ss-nav-dropdown .ss-nav-title {height: 30px;}.ss-nav-dropdown .ss-nav-title:after {content: url(\'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 13 7\" fill=\"none\"><path d=\"M6.49707 0.495605L4.0002 3.1254L0.999747 6.25096\" stroke=\"black\" stroke-linecap=\"round\"/><line x1=\"0.5\" y1=\"-0.5\" x2=\"8.48976\" y2=\"-0.5\" transform=\"matrix(-0.718691 -0.695329 0.764808 -0.644259 13 6.25098)\" stroke=\"black\" stroke-linecap=\"round\"/></svg>\');display: inline-block;width: 12px;position: relative;top: -1px;transform: rotate(-180deg);}.ss-nav-dropdown .ss-filter-button {height: 30px;width: 100%;text-align: right;white-space: nowrap;margin-right: 0;}.ss-nav-dropdown .ss-filter-button:nth-of-type(n + 1) {margin-top: 7px;}.ss-nav-dropdown .ss-filter-button:after {content: \'\';display: inline-block;height: 8px;width: 8px;margin-left: 13px;border: 1px solid black;}.ss-nav-dropdown .ss-filter-button.active:after {background-color: black;}.ss-nav-dropdown.opened .ss-nav-title {text-decoration: initial;}.ss-nav-dropdown.opened .ss-nav-title:after {transform: rotate(0deg);}.ss-nav-dropdown.opened .ss-nav-dropdown-content {margin-top: 7px;padding: 25px 30px;box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25);max-width: 250px;}/* Copy the .sorting filter styles to the new .pagination */.ss-nav-dropdown.pagination {position: relative;transition: all 0.45s;}.ss-nav-dropdown.pagination .ss-nav-dropdown-content {position: absolute;top: 100%;width: auto;z-index: -1;visibility: hidden;opacity: 0;filter: alpha(opacity=0);transition: opacity 0.45s;}.ss-nav-dropdown.pagination .ss-nav-dropdown-content {background: #fff;padding: 25px 30px;left: auto;right: -10px;}.ss-nav-dropdown.pagination .ss-nav-dropdown-content .ss-nav-list-container {text-align: right;}.ss-nav-dropdown.pagination.opened .ss-nav-dropdown-content {z-index: 1;visibility: visible;opacity: 1;}/* Filters Slideout */.ss-nav.filters {position: relative;}.ss-nav.filters .filter-swatches {overflow-x: hidden;display: block;columns: 2;grid-template-columns: repeat(2, 1fr);grid-auto-flow: row;grid-template-rows: auto;grid-column-gap: 1rem;justify-items: left;}.ss-nav.filters .ss-filter-button span {text-align: left;}.ss-facets-horizontal .ss-nav.filters .nav-content {width: 0 !important;}.ss-facets-horizontal .ss-nav.filters.opened .nav-content {width: auto !important;}/* Filters - Slideout - Facets */.ss-nav.filters.opened {z-index: 9999;}.ss-nav.filters.opened .nav-content {z-index: 9999;position: fixed;top: 0;right: 0;left: initial;width: 100%;max-width: 375px;height: 100%;padding: 5px 13px 15px 13px;filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.25));}.ss-nav.filters.opened::before {content: \'\';position: fixed;top: 0;left: 0;right: 0;bottom: 0;height: 100vh;width: 100vw;background: rgba(255, 255, 255, 0.7);z-index: -1;}.ss-nav.filters .nav-content .nav-action-container {display: flex;justify-content: flex-end;min-height: 50px;}.ss-nav.filters .nav-content .ss-nav-close {margin-right: 0;}.ss-nav.filters .nav-content .ss-nav-close:after {content: url(\'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 29 29\" fill=\"none\"><line x1=\"7.46492\" y1=\"7.49609\" x2=\"20.7871\" y2=\"20.8183\" stroke=\"black\" stroke-linecap=\"round\"/><line x1=\"7.49609\" y1=\"20.8183\" x2=\"20.8183\" y2=\"7.49612\" stroke=\"black\" stroke-linecap=\"round\"/></svg>\');display: inline-block;width: 29px;height: 29px;position: relative;right: -7px;}.ss-facets-options {height: 100%;overflow-y: auto;align-content: flex-start;}.ss-facets-horizontal .ss-nav.filters .ss-facet-container {width: 100%;margin-right: 0;margin-bottom: 0;border-bottom: 1px solid lightgray;}.ss-facet-container.opened {padding-bottom: 1rem;}.ss-facet-container .ss-nav-title {width: 100%;text-align: left;position: relative;display: flex;align-items: center;justify-content: space-between;margin-bottom: 0;padding: 19px 0 11px;}.ss-facet-container .ss-nav-title:after {content: url(\'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"17\" height=\"16\" viewBox=\"0 0 17 16\" fill=\"none\"><line x1=\"8.61914\" y1=\"0.5\" x2=\"8.61914\" y2=\"15.5\" stroke=\"black\" stroke-linecap=\"round\"/><line x1=\"0.5\" y1=\"-0.5\" x2=\"15.5\" y2=\"-0.5\" transform=\"matrix(-0.999971 0.00760761 -0.00857145 -0.999963 16.707 6.94678)\" stroke=\"black\" stroke-linecap=\"round\"/></svg>\');}.ss-facet-container.opened .ss-nav-title:after {content: \'\';height: 1px;width: 16px;background-color: black;}.ss-facet-container .ss-nav-dropdown-content {opacity: 0;height: 0;visibility: hidden;pointer-events: none;}.ss-facet-container.opened .ss-nav-dropdown-content {height: auto;opacity: 1;visibility: visible;pointer-events: auto;padding: 5px 22px 15px;}.ss-nav.filters .filter .ss-filter-button:before {border-radius: 0;height: 8px;width: 8px;margin-right: 0px;}.ss-nav.filters .ss-nav-dropdown-content .ss-filter-button {position: relative;display: flex;align-items: flex-start;justify-content: flex-start;min-height: 30px;margin-bottom: 7px;width: 100%;}.ss-nav.filters .ss-nav-dropdown-content .ss-filter-button span {display: inline-block;white-space: initial !important;width: 100%;margin-left: 13px;}.ss-nav.filters .ss-nav-dropdown-content .ss-filter-button:before {margin-top: 5px;align-self: flex-start;}@media screen and (min-width: 1025px) {/* Overrides large screen padding */.product-collection:not(.nl-collection).one-column .collection-nav .filters .nav-content {padding: 5px 13px 15px 13px;}}@media (max-width: 1024px) {.ss-nav.filters .ss-nav-list-container {display: block;}}@media (max-width: 640px) {.ss-nav {margin-left: auto;}.ss-nav.pagination .ss-filter-button {font-size: 10px;}.product-collection:not(.nl-collection) .collection-heading {align-items: flex-start;}.product-collection:not(.nl-collection).one-column .ss-facets-horizontal {max-width: 175px;flex-wrap: wrap;row-gap: 11px;}.ss-nav-dropdown.opened .ss-nav-dropdown-content {padding: 15px 13px;}.ss-facet-container.opened .ss-nav-dropdown-content {padding: 2.5px 11px 7.5px;}.ss-nav.filters.opened .nav-content {width: 100%;max-width: initial;}}@media (max-width: 300px) {.ss-nav.filters .filter-swatches {columns: 1;}}</style> ')