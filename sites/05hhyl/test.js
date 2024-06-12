window.SearchSpringInit = function(){
var self = this;


if (self.context.mobile) {
	// use mobile data
	SearchSpring.Catalog.site.id = 'x1oti4';
}

this.importer.include('autocomplete2', '.search_bar #searchinput-floating, .search_bar #searchinput-fixed, .search_box .searchinput, #searchinput-mobile');
this.importer.include('slideout', {
	width: 767
});

var brecks = {
  'acLoading': false,
  'subsearch': [
    {
      identifier     : 'blog',
      siteId         : '2mdtgz',
      resultsPerPage : 40,
      enpoint        : 'autocomplete'
    }
  ],
  'tabs': {
    default  : 'products',
    location : '',
    current  : 'products',
    previous : 'products',
    values   : [
      {
        label  : 'Search Results',
        name   : 'products',
        siteid : '05hhyl',
        order  : 1,
        class  : 'ss-has-products'
      },
      {
        label  : 'Content Results',
        name   : 'blogs',
        siteid : '2mdtgz',
        order  : 2,
        class  : 'ss-has-blogs'
      }
    ],
    getTab : function(name) {
      var tab = this.values.filter(function(tab) { return tab.name == name; }).pop();
      return tab;
    },
  },
  isMobile : function(bp) {
    return Math.min(window.innerWidth, document.documentElement.clientWidth, document.body.clientWidth) <= bp;
  },
  toggleAccordion : function(event) {
    var el = event.srcElement || event.target;
    if (el.localName == 'span') {
      el = el.parentElement;
    }
		var acToggle = angular.element(el);
    if (acToggle.hasClass('open')) {
      acToggle.removeClass('open');
      el.querySelector('.toggle-icon i').className = 'no-close fa fa-plus-circle';
    } else {
      acToggle.addClass('open');
      el.querySelector('.toggle-icon i').className = 'no-close fa fa-minus-circle';
    }
  }
}

this.importer.include('subsearch', brecks.subsearch);

this.on('afterBootstrap', function($scope) {
	// Set brecks to $scope
	$scope.brecks = brecks;

	// Check if AutoComplete is loading
	self.on('afterSearch', function($scope) {
		if ($scope.moduleName == 'autocomplete2') {
			setTimeout(function() {
				$scope.$evalAsync(function() {
					brecks.acLoading = false;
				});
			}, 500);
		}
	});
});


// --- START CONTENT TAB LOGIC

// Create tabs object
var tabs = brecks.tabs;

this.on('afterBootstrap', function($scope) {
	// Update tab location and set tabs to scope
	tabs.location = $scope.location;
	$scope.tabs = tabs;

	// Update tab details when the tab is switched
	$scope.tabs.changeTab = function(name) {
		// Getting the tab with the name that's passed in
		var tab = tabs.getTab(name);

		// Check if there are tabs
		if (tab) {
			// Change search results tab information
			this.previous = this.current;
			this.current = name;

			if (this.current != this.previous) {
				// Reset location and remove filters if tabs have changes
				var resultsLocation = $scope.location().remove('results').remove('sort').remove('page').remove('filter');
				resultsLocation = (this.current == 'blogs') ? resultsLocation.add('results', name) : resultsLocation;
				resultsLocation.go();

				// Reset search form and results
				swapTabClasses(name);
				updateSearchForms(name);
				$scope.results = [];
			}
		}
	};

	self.on('beforeSearch', function(req, config) {
		if (config.moduleName == 'subsearch' || config.moduleName == 'autocomplete2') {
			return;
		}

		// Set resultsTabName to tabs.default
		var resultsTabName = tabs.default;

		// Get location of the result set
		var resultSet = tabs.location().get('results');

		// If there is a hash, use it to change resultsTabName
		if (resultSet.length && resultSet[0][1] && (resultSet[0][1] != tabs.default)) {
			resultsTabName = resultSet[0][1];
		}

		// Update results and autocomplete current tab
		tabs.current = resultsTabName;

		// Get the tab with the name equal to resultsTabName
		var tab = tabs.getTab(resultsTabName);

		// If there's a tab, update details
		if (tab) {
      if (tab.name == 'blogs') {
        for (var key in req) {
            if (req.hasOwnProperty(key) && key.startsWith('bgfilter')) {
                delete req[key]
            }
        }
      }
			req.siteId = tab.siteid;
			swapTabClasses(tab.name);
			updateSearchForms(tab.name);
		}
	});
});

// Update the form action depending on what tab is selected
function updateSearchForms(tabName) {
	// Change the action on the actual search form
	var searchInputs = angular.element(document.querySelectorAll('.ss-ac-input'));

	if (searchInputs && searchInputs.length) {
		for (var i = 0; i < searchInputs.length; i++) {
			var searchForm = angular.element(searchInputs[i].form);

			if (searchForm && searchForm.length) {
				var resultsParam = '#results:';
				var searchFormAction = (searchForm.attr('action').split(resultsParam)[0]) + (tabName == 'blogs' ? (resultsParam + tabName) : '');
				searchForm.attr('action', searchFormAction);
			}
		}
	}
}

// Add classes for products and blogs
function swapTabClasses(tabName) {
	var bodySelector = angular.element(document.querySelectorAll('body')[0]);
	
	if (bodySelector && bodySelector.length) {
		var tabValues = tabs.values;
		for (var tab in tabValues) {
			var currentTab = tabValues[tab];
			if (currentTab.name == tabName) {
				bodySelector.addClass(currentTab.class);
			} else {
				bodySelector.removeClass(currentTab.class);
			}
		}
	}
}

this.on('afterSearch', function($scope) {
  if ($scope.moduleName == 'subsearch') { return; }
  if ($scope.tabs && $scope.tabs.current == 'blogs') {
    var tmp = document.createElement("DIV");
    angular.forEach($scope.results, function(result) {
      tmp.innerHTML = result.description;
      result.shortContent = (tmp.textContent || tmp.innerText || "");
      result.shortContent = result.shortContent.length > 158 ? (result.shortContent.substring(0, 157) + '...') : result.shortContent;
    }); 
  }
});

// --- END CONTENT TAB LOGIC




var perPage = 24;	// used for gardeners favourite - this should match default per page in SMC

// set hierarchy background filter 
// if (self.context.category && self.context.category != 'Plant Finder' ) {
// 	self.context.backgroundFilters['categoryhierarchy'] = self.context.category; 
// }

// set catid background filter
if (self.context.catid) {
	self.context.backgroundFilters.categoryid = self.context.catid;
}

// remove items from BOGO products (catid 896) from search
if(self.context.backgroundFilters.categoryid != '896' && !self.context.category){
	self.context.backgroundFilters['ss_exclude_from_search'] = '0';
}
self.context.ac = { context: { ss_exclude_from_search: '0' } };

//use new filter setup passed in script
if (self.context.filtername && self.context.filtervalue){
	self.context.backgroundFilters[self.context.filtername] = self.context.filtervalue;
}

this.on('afterBootstrap', function($scope) {
	// Click for going to url
	$scope.goToUrl = function(url) {
		window.location.replace(url);
	}

	// Toggle facet dropdowns
	$scope.currentOpen = false;
	$scope.showDropdown = function(field, ev) {
		ev.stopPropagation();
		$scope.currentOpen = $scope.currentOpen == field ? false : field;
	}

	// Close elements if clicked outside
	angular.element(document).on('click', function(ev) {
		if (ev.target.className.indexOf('no-close') == -1) {
			$scope.currentOpen = false;
		}
	});

	angular.element(window.document.querySelector('html')).on('click', function(ev) {
    if (ev.target.className.indexOf('no-close') == -1) {
		  $scope.ac.visible = false;
    } else {
      $scope.ac.visible = true;
    }

    $scope.$evalAsync();
	});
});

// promo price discount logic
var pricecat = self.context.pricecat && self.context.pricecat.toLowerCase();
var discountStorage = {};
this.on('afterSearch', function($scope) {

  if ($scope.moduleName == 'subsearch') { return; }
  if ($scope.tabs && $scope.tabs.current == 'blogs') { return; }

	angular.forEach($scope.results, function(result) {
		// set uid to first prodid value
		result.uid = result.prodid.length ? result.prodid[0] : result.uid;
		
		// parse ss_discount and store it
		if (pricecat != 'retail' && result.ss_discounts) {
			try {
				if (!discountStorage[result.uid]) {
					discountStorage[result.uid] = JSON.parse(result.ss_discounts);
				}

				if (discountStorage[result.uid]) {
					var discounts = discountStorage[result.uid][pricecat];
					result.ss_discountSelected = discounts;

					if (discounts && discounts.standard && discounts.special) {
						// regular price
						if (result.ss_price_range && Array.isArray(discounts.special)) {
							result.ss_price_range = discounts.special;
						} else if (Array.isArray(discounts.special)) {
							result.price = discounts.special[0];
						} else if (discounts.special > 0) {
							delete result.ss_price_range;
							result.price = discounts.special;
						}

						// retail price
						if (result.ss_retail_range && Array.isArray(discounts.standard)) {
							result.ss_retail_range = discounts.standard;
						} else if (Array.isArray(discounts.standard)) {
							result.msrp = discounts.standard[0];
						} else if (discounts.standard > 0) {
							delete result.ss_retail_range;
							result.msrp = discounts.standard;
						}
					}
				}
			} catch(err) {
				console.error('Error parsing product discount JSON...')
			}
		}
	});
});

// After bootstrap watcher to determine if autocomplete is open or not
this.on('afterBootstrap', function($scope) {
	var acSelectors = '.search_bar #searchinput-floating, .search_bar #searchinput-fixed';
	// Run the checkAC funtion when ac is visible
	$scope.$watch('ac.visible', function() {
		checkAC();
	});

	ensure(function() {
		var acInputs = angular.element(document.querySelectorAll(acSelectors));

		return acInputs.length;
	}, attachListeners);

	function attachListeners() {
		// Look for all autocomplete input elements
		var acInput = angular.element(document.querySelectorAll(acSelectors));

		// Loop through the autocomplete inputs and add focus/bind events
		for (var i = 0; i < acInput.length; i++) {
			angular.element(acInput[i]).bind('focus', function (e) {
				var target = e.target || e.srcElement;
				angular.element(target).addClass('ss-ac-focused');
				checkAC();
			});

			angular.element(acInput[i]).bind('blur', function (e) {
				var target = e.target || e.srcElement;
        angular.element(target).removeClass('ss-ac-focused');
			});
		}
	}

	function checkAC() {
		// Look for all autocomplete input elements
		var acInput = angular.element(document.querySelectorAll(acSelectors));

		// Loop through the autocomplete inputs and add/remove classes
		for (var i = 0; i < acInput.length; i++) {
			if (angular.element(acInput[i]).hasClass('ss-ac-focused') && $scope.ac.visible) {
				angular.element(acInput[i]).addClass('ss-ac-open');
			} else {
				angular.element(acInput[i]).removeClass('ss-ac-open');
			}
		}
	}
});

//When there is only one result, redirect the user to the product page
this.on('afterSearch', function($scope) {
  if ($scope.moduleName == 'subsearch') { return; }
  if ($scope.tabs && $scope.tabs.current == 'blogs') { return; }

	// if single product goto product page
	if ($scope.singleResult && $scope.q && $scope.breadcrumbs.length <= 1 && !$scope.moduleName && !$scope.originalQuery) {
		window.location.replace($scope.singleResult);
		$scope.$$watchers = [];
	}
});

this.on('afterSearch', function($scope) {
  if ($scope.moduleName == 'subsearch') { return; }
  if ($scope.tabs && $scope.tabs.current == 'blogs') { return; }
	// Remove category facet
	$scope.facets.grab('categoryhierarchy');
});

// -- START -- FINDER LOGIC

var mobileFinderToggle;

this.on('afterBootstrap', function($scope) {
	// oos notification
	$scope.notifyEmail = function(e) {
		var target = e.target || e.srcElement;
		notifylink(target);
	}

	$scope.finders = {};

	$scope.finders.showFinder = function() {
		$scope.location().remove('finder-results').add('finder-results').go();
		toggleFinder();
	}

	$scope.finders.hideFinder = function() {
		$scope.location().remove('finder-results').go();
		toggleFinder();
	}

	function toggleFinder() {
		var open = $scope.location().get('finder-results').pop();
		var results = angular.element(document.querySelector('#PF_maincontainer'));
		var options = angular.element(document.querySelector('.PFBody'));

		if (open) {
			results.css('display', '');
			options.css('display', 'none');
		} else {
			results.css('display', 'none');
			options.css('display', '');
		}
	}

	$scope.finders.showMobileFilters = function() {
		mobileFinderToggle = true;
		$scope.location().remove('finder-results').go();
		toggleMobileFinderFilters();
	}

	$scope.finders.hideMobileFilters = function() {
		mobileFinderToggle = true;
		$scope.location().remove('finder-results').add('finder-results').go();
		toggleMobileFinderFilters();
	}

	function toggleMobileFinderFilters() {
		var open = $scope.location().get('finder-results').pop();
		var htmlElem = angular.element(document.querySelector('html'));
		var filters = angular.element(document.querySelector('.ss-targeted #PF-filters'));

		if (open) {
			htmlElem.removeClass('mm-opened mm-background mm-top mm-front mm-fullscreen mm-opening');
			filters.removeClass('mm-current mm-opened');
		} else {
			htmlElem.addClass('mm-opened mm-background mm-top mm-front mm-fullscreen mm-opening');
			filters.addClass('mm-current mm-opened');
		}
	}

	$scope.finders.openMobileFinderSlideout = function(e, facet) {
		e.preventDefault();
		$scope.finders.mobileSelectedFacet = facet;

		$scope.slideout.toggleSlideout();
	}

	$scope.finders.checkStatus = function() {
		if (self.context.mobile) {
			ensure(function() {
				var htmlElem = angular.element(document.querySelector('html'));
				var filters = angular.element(document.querySelector('.ss-targeted #PF-filters'));
				return (htmlElem.length && filters.length);
			}, function() {
				toggleMobileFinderFilters();
			});
		} else {
			ensure(function() {
				var results = angular.element(document.querySelector('#PF_maincontainer'));
				var options = angular.element(document.querySelector('.PFBody'));
				return (results.length && options.length);
			}, function() {
				toggleFinder();
			});
		}
	}

	$scope.finders.checkStatus();
});

this.on('afterSearch', function($scope) {
  if ($scope.tabs && $scope.tabs.current == 'blogs') { return; }
	if (!$scope.moduleName) {
		$scope.finders.checkStatus();
	}
});

// -- END -- FINDER LOGIC

// special badges array (lowest to highest priority) - can only show one
var specialBadges = [{
		id: '697',
		name: 'Spring 19',
		imageUrl: '//h2.commercev3.net/cdn.brecks.com/images/BR-Ships-Spring-19.png'
	}, 
	{
		id: '53',
		name: 'BOGO',
		imageUrl: '//h2.commercev3.net/cdn.brecks.com/images/BR-BOGO-icon.png'
	},
	{
		id: '283',
		name: 'Exclusive',
		imageUrl: 'https://h2.commercev3.net/cdn.brecks.com/images/ExclusiveBR_tile.png'
	}, 
	{ 
		id: '161',
		name: 'New',
		imageUrl: '//h2.commercev3.net/cdn.brecks.com/images/BR-new-icon.png'
	},
	{
		id:'160',
		name: 'New and Exclusive',
		imageUrl: 'https://h2.commercev3.net/cdn.brecks.com/images/New-and-Exclusive_icon.png'
	},
];

var reviewArray;	// for powerreviews
this.on('afterSearch', function($scope) {
  if ($scope.tabs && $scope.tabs.current == 'blogs') { return; }
	reviewArray = [];

	if ($scope.moduleName != 'autocomplete2' && !$scope.moduleName != 'subsearch') {

		angular.forEach($scope.results, function(result) {
			// Create quantity input field for mobile add to cart
			result.qty_input = '<input type="hidden" class="qty" name="qty" id="qty_' + result.uid + '" value="1" onkeyup="priceChange(\'' + result.uid + '\',\'dynamic\',\'\',\'$\');">';

			// populate review array for powerreviews
			reviewArray.push({
				locale: 'en_US',
				api_key: 'e58290d2-d9d8-4ef8-99c7-c1d10422b52c',
				merchant_group_id: '77356',
				merchant_id: '133598',
				page_id: String(result.sku),
				enable_client_side_structured_data: false,
				components:{
					CategorySnippet: 'product_review_' + result.sku
				}
			});

			// badges - uses specialBadge array defined above
			if (result.categoryid && result.categoryid.length) {
				angular.forEach(specialBadges, function(badge) {
					if (result.categoryid.indexOf(badge.id) != -1) {
						result.specialBadge = badge;
					}
				});
			}
		});
	}
});

// add to cart functions for mobile
this.on('afterSearch', function($scope) {
  if ($scope.tabs && $scope.tabs.current == 'blogs') { return; }
	if (!$scope.moduleName && self.context.mobile) {
		angular.forEach($scope.results, function(result) {
			window['dataLayerAddtoCartEvent_' + result.uid] = function() {
				dataLayer.push({
					'event': 'addToCart',
					'ecommerce': {
						'currencyCode': 'USD',
						'add': {                         // 'add' actionFieldObject measures.
							'products': [{                 //  adding a product to a shopping cart.
								'name': result.name,         // Name or ID is required.
								'id': String(result.sku),
								'price': String(result.price),
								'category': self.context.category || 'Search Page',
								'quantity': 1,
								'coupon': ''
							 }]
						}
					}
				});
			}
		});
	}
});

// gardeners favourite functionality
// this should always follow any 'afterSearch' functionality that alters the results
// since the evenets like 'afterSearch' use a FIFO-stack-like functionality
this.on('afterSearch', function($scope) {
  if ($scope.tabs && $scope.tabs.current == 'blogs') { return; }
	if (!$scope.moduleName && self.context.catid && self.context.mobile) {
		if ($scope.pagination.currentPage == 1 && $scope.pagination.totalResults > 2) {
			// grab the first product
			$scope.gardenersFavourite = $scope.results.splice(0, 1);

			// add element on domReady
			self.on('domReady', function() {
				ensure(function() {
					return (typeof jQuery == 'function');
				}, function() {
					// Remove any existing favourites
					jQuery('.catheroprod').remove();
					
					jQuery('<li class="catheroprod"></li>').insertAfter('.searchspring-results .grid li:nth-of-type(2)');
					SearchSpring.Catalog.templates.apply();
				});

				return self.on.UNBIND;
			});
		} else {
			$scope.gardenersFavourite = [];
		}
	}
});

// function call for impression tracking
this.on('afterSearch', function($scope) {
  if ($scope.tabs && $scope.tabs.current == 'blogs') { return; }
	var skus = $scope.results.map(function(val) {
		return val.sku;
	}).join(', ');
	
	if (!$scope.moduleName && self.context.catid) {
		ensure(function() {
			return (typeof trackCategoryDetails == 'function');
		}, function() {
			trackCategoryDetails(self.context.catid, self.context.category.trim(), $scope.pagination.totalResults, skus);
		});
	} else if (!$scope.moduleName) {
		ensure(function() {
			return (typeof trackSearchDetails == 'function');
		}, function() {
			trackSearchDetails($scope.q, $scope.pagination.totalResults, skus);
		});
	} else if($scope.input && $scope.input.length > 2) {
		ensure(function() {
			return (typeof trackSearchDetails == 'function');
		}, function() {
			trackSearchDetails($scope.input, $scope.pagination.totalResults, skus);
		});
	}
});


// adjust products per page for gardeners favourite (since it offsets display)
if (this.context.mobile && this.context.catid) {
	this.on('beforeSearch', function(request, details) {
		if (!details.moduleName) {
			if (!request.page && !request.resultsPerPage) {
				request.resultsPerPage = perPage + 1
			}
		}
	});
}

this.on('domReady', function() {
  var blogs = document.querySelector('body').className.indexOf('ss-has-blogs') >= 0
  if (!blogs) {
      // jQuery things...
      ensure(function() {
        return (typeof jQuery == 'function' && !blogs);
      }, function() {
        // add to Cart for mobile
        if (self.context.mobile) {
          ensure(function() {
            return (typeof addToCartHandler == 'function' && typeof $ == 'function');
          }, function() {
            var $mobileItems = $('.searchspring-results .addtoCart');
            if ($mobileItems.length) {
              $mobileItems.off();
              addToCartHandler();
            }
          });
        } else {
          // desktop quickview
          ensure(function() {
            return (typeof jQuery.fn.colorbox == 'function' && !blogs);
          }, function() {
            // quickview on desktop
            $('.ss-targeted .quicklook-button').colorbox();
          });
        }

        // both desktop and mobile overlay
        // desktop quickview
        ensure(function() {
          return (typeof jQuery.fn.overlay == 'function' && !blogs);
        }, function() {
          // quickview on desktop
          $('.ss-targeted .overlay').overlay();
        });
      });

      // add powerreviews
      ensure(function() {
        return (reviewArray.length && typeof POWERREVIEWS == 'object' && typeof jQuery == 'function' && !blogs);
      }, function() {
        if (!mobileFinderToggle) {
          if (self.context.mobile) {
            jQuery('.ss-targeted .Cprod_reviews > div, .ss-targeted .hprod_reviews > div').empty();
          } else {
            jQuery('.ss-targeted .rev-stars > div').empty();
          }

          setTimeout(function() {
            POWERREVIEWS.display.render(reviewArray);
          });
        } else {
          mobileFinderToggle = false;
        }
      });
  }
});

if (window.location.pathname == "/plantfinder") {
	self.context.plantfinder = true;
}

if (self.context.plantfinder) {
	 self.context.backgroundFilters['ss_hard_goods'] = 0;
}

var acSearch = false
this.on('afterSearch', function($scope) {
	acSearch = $scope.moduleName == "autocomplete2";
})

this.on('_beforeAutoScroll', function() {
	if (acSearch) {
	    return false;	
	}	
});

// ensure function evaluates to true before executing callback
function ensure(func, callback) {
	var checkMax = 600;
	var checkCount = 0;
	var checkTime = 50;
	var checkInterval = setInterval(function() {
		if (func()) {
			clearInterval(checkInterval);
			callback();
		}
		checkCount ++;

		if (checkCount > checkMax) {
			clearInterval(checkInterval);
		}
	}, checkTime);
}

this.on('afterSearch', function($scope) {
  if ($scope.moduleName == 'subsearch') { return; }
  if ($scope.tabs && $scope.tabs.current == 'blogs') { return; }
	if (self.context && self.context.category) {
		var position = 0
		var itemListElementArr = []
		angular.forEach($scope.results, function(result) {
			var re = /<\w+>.*<\/\w+>/
            var stripName = result.name.replace(re, '')
            result.position = position += 1

            itemListElementArr.push({
            	"@type": "ListItem",
            	"position": result.position,
            	"name": stripName,
            	"url": result.url
            })
		})
		self.on('domReady', function() {
			var resultsContainer = document.getElementById('product')
			var script = document.createElement("script")
			var code = JSON.stringify({
				"@context" : "http://schema.org",
				"@type": "CollectionPage",
				"name": self.context.category,
				"url": window.location.href,
				"mainEntity": {
					"@type": "ItemList",
					"itemListElement": itemListElementArr
				}
			})
			script.type = 'application/ld+json'

			try{
				if (resultsContainer){
					script.appendChild(document.createTextNode(code))
					resultsContainer.prepend(script)
				}
			} catch (e) {
				if (resultsContainer) {
					script.text = code
					resultsContainer.prepend(script)
				}
			}
		})
	}
})

// Inline Banners
this.on('afterSearch', function($scope) {
  if ($scope.moduleName == 'subsearch') { return; }
    if ($scope.pagination.totalResults && $scope.merchandising.content.inline) {
	    // for banner positions beyond pagination index
	    var tailBanners = [];
	
	    var adjustedBegin = $scope.pagination.begin - 1;
	    var end = $scope.pagination.end;
	
	    $scope.merchandising.content.inline.sort(function(a, b) {
	    	return a.config.position.index - b.config.position.index;
	    }).filter(function(banner) {
	      	var index = banner.config.position.index;
	
			if (index >= adjustedBegin) {
				if (index <= end - 1) {
					return true;
				} else {
				    tailBanners.push(bannerToResult(banner));
				}
			}
	    }).map(function(banner) {
	        var adjustedIndex = banner.config.position.index - adjustedBegin;
	
	        $scope.results.splice(adjustedIndex, 0, bannerToResult(banner));
	    });
	
	    var totalResults = Math.min($scope.pagination.totalResults, end);
	    var missingResults = totalResults - (adjustedBegin + $scope.results.length);
	    if (missingResults) {
	        var lastPage = $scope.pagination.nextPage == 0;
	  
	        var sliceStart = 0;
	        if (lastPage) {
	          sliceStart = tailBanners.length - missingResults;
	        }
	  
	        var missingBanners = tailBanners.slice(sliceStart, sliceStart + missingResults);
	        $scope.results = $scope.results.concat(missingBanners);
    	}
    }
});

function bannerToResult(banner) {
	return {
		uid: 'inlineBanner-index-' + banner.config.position.index,
		isInlineBanner: true,
		content: banner.value
	}
}

this.on('afterSearch', function($scope) {
  setTimeout(function() {
    if ($scope.moduleName == 'autocomplete2' && $scope.q) {
      // Search for blogs to display in autocomplete
      $scope.$parent.subsearch.blog.suboptions.q = $scope.q;
      $scope.$parent.subsearch.blog.search();
    }
  });
})

var initialLoad = true;

this.on('afterSearch', function($scope) {
  	// keep autocomplete visible if content results found
  	if ($scope.moduleName == 'subsearch' && $scope.results.length) {
    	$scope.$parent.ac.visible = true;
  	}

	// force Content Tab to display if 0 Product Results found
  	if (!$scope.moduleName && initialLoad && $scope.tabs.current == 'products' && !$scope.results.length && $scope.q != "") {
    	initialLoad = false;
    	tabs.changeTab('blogs');
    	 $scope.blogsOnly = true;
  	}
});
}
SearchSpring.Catalog.templates.promises.receive.resolve('<!-- Stylesheet --><link rel=\"stylesheet\" href=\"//cdn.searchspring.net/ajax_search/sites/05hhyl/css/05hhyl.css\" /><!-- AutoComplete --><script type=\"text/template\" name=\"AutoComplete\" target=\"[ss-autocomplete]\"><div class=\"ss-ac-wrapper\" ng-show=\"ac.visible\" ng-class=\"{\'no-terms\': ac.terms.length == 0}\"><div id=\"ss-ac-terms\" ng-show=\"ac.terms\"><ul><li ng-repeat=\"term in ac.terms\" ng-class=\"{active: term.active}\"><a ng-bind-html=\"term.label | trusted\" ss-nav-selectable ng-focus=\"term.preview()\" href=\"{{ term.url }}\" ss-no-ps></a></li></ul><div class=\"blogsearchdrop\" ng-if=\"!brecks.isMobile(1099) && subsearch.blog.results && subsearch.blog.results.length\" ng-class=\"{\'ss-ac-loading\': brecks.acLoading, \'ss-ac-not-loading\': !brecks.acLoading}\"><h2 class=\"text_center\">Content Results</h2><div id=\"ss-ac-content-results\"></div></div></div><div id=\"ss-ac-content\" ng-if=\"!brecks.isMobile(1099) || !subsearch.blog.results.length\"><div id=\"ss-ac-facets\" ng-show=\"ac.facets\"></div><div id=\"ss-ac-results\"></div></div><div class=\"searchdropmob\" ng-if=\"brecks.isMobile(1099) && subsearch.blog.results && subsearch.blog.results.length\"><div class=\"accordion-container\"><div class=\"accordion-toggle no-close open\" ng-click=\"brecks.toggleAccordion($event)\"><span class=\"no-close\">Search Results</span><span class=\"no-close toggle-icon\"><i class=\"no-close fa fa-minus-circle\"></i></span></div><div class=\"accordion-content\"><div id=\"id=\"ss-ac-content\"><div id=\"ss-ac-facets\" ng-show=\"ac.facets\"></div><div id=\"ss-ac-results\"></div></div></div></div><div class=\"accordion-container\"><div class=\"accordion-toggle no-close\" ng-click=\"$event.preventDefault(); brecks.toggleAccordion($event)\"><span class=\"no-close\">Content Results</span><span class=\"no-close toggle-icon\"><i class=\"no-close fa fa-plus-circle\"></i></span></div><div class=\"accordion-content\" ng-class=\"{\'ss-ac-loading\': brecks.acLoading, \'ss-ac-not-loading\': !brecks.acLoading}\"\"><div id=\"id=\"ss-ac-content\"><div id=\"ss-ac-content-results\"></div></div></div></div></div></script><script type=\"text/template\" name=\"AutoComplete - Content\" target=\"[ss-autocomplete] #ss-ac-content-results\"><div class=\"blogdroptile\" ng-repeat=\"result in subsearch.blog.results | limitTo:2\" ss-nav-selectable><a ng-href=\"{{ result.url }}\" intellisuggest ss-no-ps><imgng-src=\"{{ result.thumbnailImageUrl ? result.thumbnailImageUrl : \'//cdn.searchspring.net/ajax_search/img/default_image.png\' }}\"onerror=\"this.src=\'//cdn.searchspring.net/ajax_search/img/default_image.png\';\"alt=\"{{ result.name }}\"width=\"100%\"/></a><h3 class=\"blogtiletitle\"><a ng-href=\"{{ result.url }}\" intellisuggest ss-no-ps>{{ result.name }}</a></h3></div><div id=\"ss-ac-more\" class=\"ss-content-btn\"><a ng-repeat=\"term in ac.terms\" ng-if=\"term.active\" ng-href=\"{{ term.url + \'#results:blogs\' }}\" ss-nav-selectable ss-no-ps><h5>See more Content Results<span>&nbsp;for<strong>\"{{ ac.q }}\"</strong></span></h5></a></div></script><script type=\"text/template\" name=\"AutoComplete - Results\" target=\"[ss-autocomplete] #ss-ac-results\"><h4>Search Results for<strong>\"{{ ac.q }}\"</strong></h4><divng-if=\"!brecks.isMobile(1099) && ac.merchandising.content.header.length > 0\"id=\"ss-ac-merch_header\"class=\"merchandising\"ss-merchandising=\"ac.header\"></div><div ng-if=\"ac.merchandising.content.banner.length > 0\" id=\"ss-ac-merch_banner\" class=\"merchandising\" ss-merchandising=\"ac.banner\"></div><div ng-if=\"ac.results.length == 0\">No product results found for \"{{ ac.q }}\"</div><!-- Items --><ul class=\"item-results\" ng-if=\"ac.results.length\"><li class=\"item\" ng-repeat=\"result in ac.results | limitTo:6\"><div ng-if=\"result.isInlineBanner\" class=\"ss-inline-banner\" ng-bind-html=\"result.content | trusted\"></div><a ng-if=\"!result.isInlineBanner\" ng-href=\"{{ result.url }}\" ss-nav-selectable><div class=\"item-image\"><div class=\"image-wrapper\"><imgng-src=\"{{ result.thumbnailImageUrl ? result.thumbnailImageUrl : \'//cdn.searchspring.net/ajax_search/img/default_image.png\' }}\"onerror=\"this.src=\'//cdn.searchspring.net/ajax_search/img/default_image.png\';\"alt=\"{{ result.name }}\"title=\"{{ result.name }}\"/></div></div><div class=\"item-details\"><p class=\"item-name\" ng-bind-html=\"result.name | trusted\">{{ result.name.length > 40 ? (result.name.substring(0, 37) + \'...\') : result.name }}</p><png-if=\"!result.ss_price_range && !result.ss_retail_range && !result.ss_child_price_range\"class=\"item-price\"ng-class=\"{\'has-qty\': result.ss_pkg_qty && (result.ss_pkg_qty * 1 > 1)}\"><span class=\"regular\" ng-class=\"{\'on-sale\': result.msrp && (result.msrp * 1) > (result.price * 1)}\">{{ result.ss_pkg_qty && (result.ss_pkg_qty * 1 >= 1) ? (result.ss_pkg_qty + \' for \' ) : \'\' }}${{ result.price | number:2 }}</span><span ng-if=\"result.msrp && (result.msrp * 1) > (result.price * 1)\" class=\"msrp\">{{ result.ss_pkg_qty && (result.ss_pkg_qty * 1 >= 1) ? (result.ss_pkg_qty + \' for \' ) : \'\' }}${{ result.msrp | number:2 }}</span></p><p ng-if=\"result.ss_price_range || result.ss_retail_range\" class=\"item-price has-range\"><spanclass=\"regular\"ng-class=\"{\'on-sale\': result.ss_retail_range && (result.ss_price_range[0] != result.ss_retail_range[0]) || (result.ss_price_range[1] != result.ss_retail_range[1])}\"><span ng-if=\"result.ss_price_range[0] != result.ss_price_range[1]\">${{ result.ss_price_range[0] | number:2 }} to ${{ result.ss_price_range[1] | number:2 }}</span><span ng-if=\"result.ss_price_range[0] == result.ss_price_range[1]\">${{ result.ss_price_range[0] | number:2 }}</span></span><spanng-if=\"result.ss_retail_range && (result.ss_price_range[0] != result.ss_retail_range[0]) || (result.ss_price_range[1] != result.ss_retail_range[1])\"class=\"msrp\">${{ result.ss_retail_range[0] | number:2 }} to ${{ result.ss_retail_range[1] | number:2 }}</span></p><p ng-if=\"result.ss_child_price_range\" class=\"item-price has-range\"><spanclass=\"regular\"ng-class=\"{\'on-sale\': result.ss_child_retail_range && (result.ss_child_price_range[0] != result.ss_child_retail_range[0]) || (result.ss_child_price_range[1] != result.ss_child_retail_range[1])}\"><span ng-if=\"result.ss_child_price_range[0] != result.ss_child_price_range[1]\">${{ result.ss_child_price_range[0] | number:2 }} to ${{ result.ss_child_price_range[1] | number:2 }}</span><span ng-if=\"result.ss_child_price_range[0] == result.ss_child_price_range[1]\">${{ result.ss_child_price_range[0] | number:2 }}</span></span><spanng-if=\"result.ss_child_retail_range && (result.ss_child_price_range[0] != result.ss_child_retail_range[0]) || (result.ss_child_price_range[1] != result.ss_child_retail_range[1])\"class=\"msrp\">${{ result.ss_child_retail_range[0] | number:2 }} to ${{ result.ss_child_retail_range[1] | number:2 }}</span></p></div></a></li></ul><div ng-if=\"ac.merchandising.content.footer.length > 0\" id=\"ss-ac-merch_footer\" class=\"merchandising\" ss-merchandising=\"ac.footer\"></div><div ng-if=\"ac.pagination.totalResults > 1\" id=\"ss-ac-more\" ng-show=\"ac.terms.length\"><a ng-repeat=\"term in ac.terms\" ng-if=\"term.active\" ng-href=\"{{ term.url }}\" ss-nav-selectable ss-no-ps><h5>See more results for<strong>\"{{ ac.q }}\"</strong></h5></a></div></script><script type=\"text/template\" name=\"AutoComplete - Facets\" target=\"[ss-autocomplete] #ss-ac-facets\"><divng-repeat=\"facet in ac.facets | filter:{ type: \'!slider\' } | limitTo:3\"ng-switch=\"facet.type\"ng-if=\"facet.values.length\"id=\"searchspring-{{ facet.field }}\"class=\"facet-container\"ng-class=\"{\'list\': facet.type == \'list\' || facet.type == \'hierarchy\' || facet.type == \'slider\' || !facet.type, \'palette\': facet.type == \'palette\', \'grid\': facet.type == \'grid\'}\"><h4>{{ facet.label }}</h4><ul ng-switch-when=\"grid\"><li ng-repeat=\"value in facet.values | limitTo:8\" ng-class=\"{active: value.active}\"><a href=\"{{ value.url }}\" ss-nav-selectable ng-focus=\"value.preview()\" ss-no-ps><span class=\"grid-value\">{{ value.label }}</span></a></li></ul><ul ng-switch-when=\"palette\"><li ng-repeat=\"value in facet.values | limitTo:8\" ng-class=\"{active: value.active}\"><a href=\"{{ value.url }}\" ss-nav-selectable ng-focus=\"value.preview()\" alt=\"{{ value.label }}\" title=\"{{ value.label }}\" ss-no-ps><spanng-style=\"{\'background-color\': value.label.toLowerCase() }\"class=\"color-value color-value-{{ value.label.toLowerCase().replace(\' \', \'-\') }}\"></span></a></li></ul><ul ng-switch-default><li ng-repeat=\"value in facet.values | limitTo:8\" ng-class=\"{active: value.active}\"><a href=\"{{ value.url }}\" ss-nav-selectable ng-focus=\"value.preview()\" ss-no-ps>{{ value.label }}</a></li></ul></div><div ng-if=\"ac.merchandising.content.left.length > 0\" id=\"ss-ac-merch_left\" class=\"merchandising\" ss-merchandising=\"ac.left\"></div></script><!-- Desktop - Facets --><scripttype=\"text/template\"name=\"Desktop - Facets\"module=\"search\"target=\".searchspring-container .searchspring-results .cat_filter_options, .searchspring-finder-container .searchspring-results .cat_filter_options\"><div ng-if=\"!slideout.triggered\"><h3 class=\"heading\"><span>Narrow Selection</span></h3><div class=\"left_filter\"><divng-repeat=\"facet in facets\"id=\"searchspring-{{ facet.field }}_container\"class=\"left_filters toolbar-menu per-page-menu\"ng-class=\"{\'open\': currentOpen == facet.field}\"><div class=\"menu-label\" ng-click=\"showDropdown(facet.field, $event)\"><strong>{{ facet.label }}</strong><div class=\"menu-toggle-icon\"></div></div><ul class=\"menu-options ss-checkboxes ss-options\"><li ng-repeat=\"value in facet.values\"><a href=\"{{ value.url }}\" class=\"no-close\" ng-class=\"{\'highlight\': value.active}\">{{ value.label }}<span class=\"facet-count\">({{ value.count }})</span></a></li></ul></div></div></div></script><!-- Desktop - Filter Summary --><script type=\"text/template\" name=\"Desktop - Filter Summary\" target=\".searchspring-container .searchspring-summary\"><div id=\"paging\" style=\"border-bottom-width:0px;\"><div class=\"normaltext\"><strong class=\"txt_green f18\">List Narrowed By:</strong><a ng-repeat=\"filter in filterSummary\" href=\"{{ filter.remove.url }}\"><div class=\"sort_strip\"><span class=\"summary-label\">{{ filter.filterLabel }}:</span><strong><span class=\"summary-value\">{{ filter.filterValue }}</span></strong><span style=\"margin: 0px 5px;\" class=\"right\" rel=\"nofollow\"><imgsrc=\"//h2.commercev3.net/cdn.brecks.com/images/remove_cart_icon.png\"alt=\"Remove {{ filter.filterLabel }}: {{ filter.filterValue }} Filter\"/></span></div></a><a href=\"{{ location().remove(\'filter\').remove(\'rq\').url() }}\" rel=\"nofollow\"><div class=\"sort_strip\"><strong>&nbsp;</strong><div class=\"filter_container\" style=\"display: inline-block; float: right;\"><strong>Clear All Filters &nbsp;<span class=\"mm-clearfilter bold right bluetitle f13\"><img src=\"//h2.commercev3.net/cdn.brecks.com/images/remove_cart_icon.png\" alt=\"Clear All Filters\" /></span></strong></div></div></a></div></div></script><!-- Mobile - Facets --><script type=\"text/template\" name=\"Mobile - Facets\" target=\"#searchspring-slideout_facets .searchspring-facets\"><divng-repeat=\"facet in facets | filter: { field: finders.mobileSelectedFacet.field }\"ng-switch=\"facet.type\"ng-if=\"(facet.type == \'hierarchy\' ? facet.values.length : true)\"id=\"searchspring-{{ facet.field }}\"class=\"PFfilterlist facet-container {{ facet.type ? facet.type : \'list\' }}\"><h3 class=\"filtertitle\" ng-click=\"facet.collapse = !facet.collapse\" ng-class=\"{\'open\': !facet.collapse}\">{{ facet.label }}</h3><ul ng-switch-default class=\"ss-checkboxes ss-options\"><li ng-repeat=\"value in facet.values\"><a href=\"{{ value.url }}\" ng-class=\"{\'highlight\': value.active}\" label=\"{{ value.value }}\">{{ value.label }}<span class=\"facet-count\">({{ value.count }})</span></a></li></ul><div ng-if=\"merchandising.content.left.length > 0\" id=\"searchspring-merch_left\" ss-merchandising=\"left\"></div></div><div ng-if=\"context.plantfinder\"><p>Whether you are filling a gap in a mixed-perennial border, planning a new bulb garden or looking for the perfect cutting flower to grow, let theBreck’s Plant Finder help you decide what you need. It is easy to use and can save you a lot of time. Just check the applicable boxes and thenclick on the Find Plants button to view your options!</p></div></script><!-- Mobile - Filter Summary --><scripttype=\"text/template\"name=\"Mobile - Filter Summary\"target=\".searchspring-mobile-container .searchspring-mobile-summary, .searchspring-mobile-finder_container .searchspring-mobile-summary\"><span ng-click=\"filter.remove.go()\" ng-repeat=\"filter in filterSummary\" class=\"selectfilterd\">{{ filter.filterLabel }}: {{ filter.filterValue }}<strong style=\"position:absolute; line-height:10px; right:10px; top:10px;\"><a href=\"{{ filter.remove.url }}\">X</a></strong></span><ahref=\"{{ location().remove(\'filter\').remove(\'rq\').url() }}\"style=\"padding: 4px 8px;border-radius: 3px;vertical-align: top;margin: 2px 0 0;display: inline-block;\"class=\"button_red\"><strong>Clear All</strong></a></script><!-- Filter Messages --><script type=\"text/template\" name=\"Filter Messages\" target=\".searchspring-filter_messages\"><p ng-if=\"pagination.totalResults === 0 && filterSummary.length === 0\">There are no results to refine! If you need additional help, please try our \"<strong>Suggestions</strong>\" to the right.</p><p ng-if=\"pagination.totalResults === 0 && filterSummary.length\" class=\"{{ summaryClass }}\">If you are not seeing any results, try removing some of your selected filters above.</p><p ng-if=\"pagination.totalResults && filterSummary.length === 0\">There are no filters to refine by! Perhaps try a new search?</p></script><!-- Finder - Selections --><script type=\"text/template\" name=\"Finder - Selections\" module=\"search\" target=\".searchspring .PFBody .PFfilterbar\"><div class=\"PFbarleft finder-filter-summary\"></div><div class=\"PFbarright\"><span style=\"margin: 0 70px 0 0; display: inline-block;\"></span><input ng-click=\"finders.showFinder()\" type=\"button\" value=\"Find Plants\" class=\"button_red findplant f18\" style=\"box-shadow:none;\" /></div></script><!-- Finder Container --><script type=\"text/template\" name=\"Finder Container\" target=\".searchspring .PFBody .PFfilterbody\"><div ng-if=\"facets.length\"><div ng-repeat=\"facet in facets\" class=\"PFfilterlist list\"><h3 class=\"filtertitle\">{{ facet.label }}</h3><ul class=\"ss-checkboxes ss-options\"><li ng-repeat=\"value in facet.values\"><a href=\"{{ value.url }}\" ng-class=\"{\'highlight\': value.active}\" name=\"filter\" label=\"{{ value.value }}\">{{ value.value }}<span class=\"facet-count\">({{ value.count }})</span></a></li></ul></div><inputng-click=\"finders.showFinder()\"type=\"button\"value=\"Find Plants\"class=\"button_red findplant f18 right\"style=\"box-shadow:none; margin:7% 35px 20px;\"/></div></script><!-- Finder - Toolbar --><script type=\"text/template\" name=\"Finder - Toolbar\" module=\"search\" target=\".searchspring #PF_maincontainer .searchspring-finder-toolbar\"><div class=\"left_col\"><ang-click=\"finders.hideFinder()\"style=\"font-weight:bold;display: inline-block;padding: 10px;border-radius: 5px;\"class=\"button_red showfindplant\">Back to Plant Finder</a></div><div class=\"right_col no_padding finder-filter-summary\"></div></script><!-- Finder - Filter Summary --><script type=\"text/template\" name=\"Finder - Filter Summary\" target=\".searchspring .finder-filter-summary\"><div ng-if=\"filterSummary.length\" class=\"filter-summary-wrapper\"><strong class=\"f24 bluetitle\">Your Selections:</strong><a ng-repeat=\"filter in filterSummary\" href=\"{{ filter.remove.url }}\"><div class=\"selectedfilter\"><div class=\"bold f13 summary-label\" style=\"display:inline-block;\">{{ filter.value }}</div>&nbsp;&nbsp;<span style=\"margin:0px 0px 0 5px;\" class=\"mm-clearfilter bold right bluetitle f13\">x</span></div></a><ahref=\"{{ location().remove(\'filter\').remove(\'rq\').url() }}\"ng-click=\"finders.hideFinder()\"style=\"padding: 4px 8px;border-radius: 3px;vertical-align: top;margin: 3px 0 0;display: inline-block;\"class=\"button_red\"><strong>Clear All</strong></a></div></script><!-- Finder - Results & No Results --><scripttype=\"text/template\"name=\"Finder - Results &amp; No Results\"module=\"search\"target=\".searchspring #PF_maincontainer .searchspring-finder-container\"><div ng-if=\"pagination.totalResults\" class=\"searchspring-results\"><div ng-if=\"!brecks.isMobile(1099) && merchandising.content.header.length > 0\" id=\"searchspring-merch_header\" ss-merchandising=\"header\"></div><div ng-if=\"!tabs || facets.length\" class=\"cat_filter_options\"></div><div class=\"searchspring-toolbar\"></div><div class=\"sorting_bar ss_sort font_arial\"></div><div ng-if=\"merchandising.content.banner.length > 0\" id=\"searchspring-merch_banner\" ss-merchandising=\"banner\"></div><div class=\"category_page_products plantfinder_products\"><ul class=\"product_row\"></ul></div><div ng-if=\"merchandising.content.footer.length > 0\" id=\"searchspring-merch_footer\" ss-merchandising=\"footer\"></div><div class=\"sorting_bar font_arial\"></div></div><div ng-if=\"pagination.totalResults === 0\" class=\"searchspring-no_results\"></div></script><!-- Mobile Finder - Filters --><script type=\"text/template\" name=\"Mobile Finder - Filters\" target=\".searchspring-mobile-finder_filters\"><div id=\"PF-filters\" class=\"mm-menu mm-fullscreen mm-offcanvas mm-top mm-front mm-iconpanel\"><div class=\"mm-panel mm-opened mm-current mm-iconpanel-0\" id=\"mm-8\"><a href=\"#mm-8\" class=\"mm-subblocker\"></a><ul class=\"mm-listview\"><li class=\"statlist\" style=\"background:#36382d; margin:-40px 0 0; text-align:center;\"><a href=\"/\" style=\"display: inline-block;padding: 0;\" ss-no-ps><img src=\"https://h2.commercev3.net/cdn0.brecks.com/images/logo_m.png\" alt=\"Brecks Bulbs\" style=\"margin:0px 0;\" /></a></li><li class=\"statlist\" style=\"margin:0px 0 0; text-align:center;\"><img src=\"https://h2.commercev3.net/cdn0.brecks.com/images/plantfinderheader.jpg\" style=\"margin-left:-20px\" /></li><li ng-if=\"facets.length\" class=\"statlist\" style=\"background:#fffae4;\"><span style=\"display: inline-block; text-align:left;width: 40%;padding: 5px 10px;vertical-align: middle;\"><strong class=\"f18\">Refine ({{ pagination.totalResults }})</strong></span><span style=\"display: inline-block; text-align:center;width: 40%;vertical-align: middle;\"><inputtype=\"button\"value=\"Find Plants\"class=\"button_yellow2\"style=\"width:100%; padding:10px 5px; font-weight:bold;\"ng-click=\"finders.hideMobileFilters();\"/></span></li><li ng-repeat=\"facet in facets\"><a href=\"javascript:void(0);\" ng-click=\"finders.openMobileFinderSlideout($event, facet)\" class=\"mm-next mm-fullsubopen\"></a><span label=\"{{ facet.label }}\">{{ facet.label }}</span><span ng-if=\"facet.facet_active\" style=\"padding: 0 20px 10px; margin:0;\"><span ng-repeat=\"value in facet.values | filter: { active: \'true\' }\" class=\"selected_filter\" style=\"margin-right: 15px;\"><span>{{ value.label }}</span><a href=\"{{ value.url }}\" class=\"mm-clearfilter\">x</a></span></span></li><li class=\"statlist\"><span style=\"display: block; text-align:center;width: 70%;padding: 0;margin: auto;\"><input type=\"button\" value=\"Find Plants\" class=\"button_yellow2\" style=\"width:100%;font-weight:bold;\" ng-click=\"finders.hideMobileFilters();\" /></span></li><p style=\"margin: 10px;\">Whether you are filling a gap in a mixed-perennial border, planning a new bulb garden or looking for the perfect cutting flower to grow, let theBreck’s Plant Finder help you decide what you need. It is easy to use and can save you a lot of time. Just check the applicable boxes and thenclick on the Find Plants button to view your options!</p></ul></div></div></script><!-- Mobile Finder - Results & No Results --><script type=\"text/template\" name=\"Mobile Finder - Results &amp; No Results\" module=\"search\" target=\".searchspring-mobile-finder_container\"><div ng-if=\"pagination.totalResults\" class=\"searchspring-results\"><div class=\"easyplantfinder\"><a ng-click=\"finders.showMobileFilters();\" class=\"catfilters\"><img src=\" https://h2.commercev3.net/cdn0.brecks.com/images/easyplantfinder.jpg\" alt=\"\" style=\"width:100%;\" /></a></div><div ng-if=\"merchandising.content.header.length > 0\" id=\"searchspring-merch_header\" ss-merchandising=\"header\"></div><h2 class=\"f18 arial_font head_name searchspring-search-count-title\" align=\"center\"></h2><div class=\"pagination_bar\"><div class=\"catsort ss-sorting\"></div><div ng-if=\"filterSummary.length\" id=\"category_filter\" class=\"searchspring-mobile-summary\"></div></div><div ng-if=\"merchandising.content.banner.length > 0\" id=\"searchspring-merch_banner\" ss-merchandising=\"banner\"></div><div class=\"category_products\"><ul class=\"display grid\"></ul></div><div ng-if=\"merchandising.content.footer.length > 0\" id=\"searchspring-merch_footer\" ss-merchandising=\"footer\"></div><div ng-if=\"pagination.totalPages > 1\" class=\"pagination_bar ss-mobile-pagination arial_font\"><!-- mobile pagination target --></div></div><div ng-if=\"pagination.totalResults === 0\" class=\"searchspring-no_results\"></div></script><script type=\"text/template\" name=\"Search Page Title\" module=\"search\" target=\".right_col > .search-page-title:first-child\"></script><!-- Desktop - Search Page Title --><scripttype=\"text/template\"name=\"Desktop - Search Page Title\"module=\"search\"target=\".searchspring-results .search-page-title.ss-page-title, .filter-summary-wrapper .search-page-title.ss-page-title\"><span ng-if=\"pagination.totalResults && pagination.totalResults > pagination.perPage && context.plantfinder\" class=\"results-title\">{{ pagination.totalResults }} results</span><h6 ng-if=\"blogsOnly\">We could not find any products related to your search for \"{{q}}\", but we did find the following blog content:</h6><span ng-if=\"pagination.totalResults && pagination.totalResults > pagination.perPage && !context.plantfinder\" class=\"results-title\">{{ pagination.begin }} - {{ pagination.end }} of {{ pagination.totalResults }} results {{ q ? (\'for \\u0022\' + q + \'\\u0022\') : \'\' }}</span><span ng-if=\"pagination.totalResults && pagination.totalResults <= pagination.perPage\" class=\"results-title\">{{ pagination.totalResults }} result{{ pagination.totalResults > 1 ? \'s\' : \'\' }} {{ q ? (\'for \\u0022\' + q + \'\\u0022\') : \'\' }}</span><h5 ng-if=\"pagination.totalResults && query.original\" style=\"font-size: 18px;margin: 8px 0 0;font-weight: 500;\">No results found for {{ \'\\u0022\' + query.original + \'\\u0022\'}}</h5></script><!-- Desktop - Results & No Results --><script type=\"text/template\" name=\"Desktop - Results &amp; No Results\" module=\"search\" target=\".searchspring-container\"><div ng-if=\"slideout.triggered && (tabs.current == \'products\')\" class=\"searchspring-toolbar\"></div><div class=\"ss-toolbar-column ss-tabs\"><ul class=\"resulttabsbar\"><li ng-repeat=\"tab in tabs.values | orderBy: \'order\'\" class=\"ss-list-option\" ng-class=\"{\'ss-active active\': tabs.current == tab.name}\"><a ng-click=\"tabs.changeTab(tab.name)\" class=\"ss-list-link ss-pointer contentsearchanchor\">{{ tab.label }}</a></li></ul></div><div ng-if=\"pagination.totalResults\" class=\"searchspring-results\"><h1 class=\"heading search-page-title ss-page-title\"></h1><div ng-if=\"!brecks.isMobile(1099) && merchandising.content.header.length >0\" id=\"searchspring-merch_header\" ss-merchandising=\"header\"></div><div ng-if=\"facets.length && (tabs.current == \'products\')\" class=\"cat_filter_options\"></div><div ng-if=\"filterSummary.length && (tabs.current == \'products\')\" class=\"sort_row searchspring-summary\" style=\"padding:5px 10px;\"></div><div class=\"sorting_bar clear\"></div><div ng-if=\"merchandising.content.banner.length >0\" id=\"searchspring-merch_banner\" ss-merchandising=\"banner\"></div><div ng-if=\"tabs.current == \'products\'\" class=\"ss-item-container ss-item-container-products ss-flex-wrap\"><div class=\"clearfix\" id=\"product\"><ul class=\"product_row\"></ul></div></div><div ng-if=\"tabs.current == \'blogs\'\" class=\"ss-item-container ss-item-container-blogs blogcontentcontainer\"></div><div ng-if=\"merchandising.content.footer.length >0\" id=\"searchspring-merch_footer\" ss-merchandising=\"footer\"></div><div class=\"sorting_bar\"></div></div><div ng-if=\"pagination.totalResults === 0\" class=\"searchspring-no_results\"></div></div></script><!-- SearchSpring Content Results --><script type=\"text/template\" name=\"SearchSpring Content Results\" module=\"search\" target=\".ss-item-container-blogs\"><div class=\"blogsearchcontainer\"><div class=\"blogtile\" ng-repeat=\"result in results\"><a class=\"blogimage\" ng-href=\"{{ result.url }}\"><imgng-src=\"{{ result.thumbnailImageUrl ? result.thumbnailImageUrl : \'//cdn.searchspring.net/ajax_search/img/default_image.png\' }}\"onerror=\"this.src=\'//cdn.searchspring.net/ajax_search/img/default_image.png\';\"alt=\"{{ result.name }}\"width=\"100%\"/></a><h3 class=\"blogtiletitle\"><a ng-href=\"{{ result.url }}\" intellisuggest>{{ result.name }}</a></h3><p>{{ result.shortContent }}</p><a class=\"ss-more\" ng-href=\"{{ result.url }}\" intellisuggest>Continue Reading &#187;</a></div></div></script><!-- SearchSpring Sidebar --><script type=\"text/template\" name=\"SearchSpring Sidebar\" module=\"search\" target=\".searchspring-toolbar\"><div ng-if=\"!slideout.triggered\" class=\"ss-sidebar-container\"><h3 ng-if=\"facets.length > 0\" class=\"heading\"><span>Narrow Selection</span></h3><ul ng-if=\"facets.length\" class=\"nav ss-facets\"></ul></div><divng-if=\"brecks.isMobile(1099) && merchandising.content.header.length > 0\"id=\"ss-merch_header\"class=\"merchandising\"ss-merchandising=\"header\"></div><div ng-if=\"slideout.triggered && pagination.totalResults && facets.length > 0\" class=\"ss-slideout-button\" slideout><span class=\"ss-slideout-button-icon\"></span><span class=\"ss-slideout-button-label\">Filter Options</span></div><div><div ng-if=\"facets.length === 0\" class=\"ss-filter-messages\"></div></div></script><!-- Desktop - Sort & Pagination --><scripttype=\"text/template\"name=\"Desktop - Sort &amp; Pagination\"target=\".searchspring-container .searchspring-results .sorting_bar, #PF_maincontainer .right_col .sorting_bar, .ss_sort, .searchspring-finder-container .searchspring-results .sorting_bar\"><div class=\"filterleft\" ng-if=\"tabs.current == \'products\'\"><span class=\"viewtabs\"><a class=\"gridview active\"></a><a class=\"listview\"></a></span></div><div class=\"sprting_filters\"><span class=\"ss-sorting\"></span></div><span ng-if=\"pagination.totalPages > 1\" class=\"pagination\"><a ng-if=\"pagination.previous\" ng-href=\"{{ pagination.previous.url }}\">&laquo;</a>&nbsp;&nbsp; Page:<span ng-repeat=\"page in pagination.getPages(5)\" class=\"pagenumber\"><a ng-if=\"!page.active\" aria-label=\"Page {{ page.number }}\" ng-href=\"{{ page.url }}\">{{ page.number }}</a><strong ng-if=\"page.active\" class=\"current-page\">{{ page.number }}</strong>&nbsp;</span><a ng-if=\"pagination.next\" ng-href=\"{{ pagination.next.url }}\">&raquo;</a>&nbsp;&nbsp;<span class=\"show-all-less\"><a href=\"\" ng-if=\"pagination.totalPages > 1 && pagination.perPage != 500\" ng-click=\"pagination.perPage = n\" ng-repeat=\"n in [500]\">View All</a><ahref=\"\"ng-if=\"pagination.totalResults > 24 && pagination.totalPages == 1 || pagination.perPage == 500\"ng-click=\"pagination.perPage = n\"ng-repeat=\"n in [24]\">View Less</a></span><span class=\"ss-viewall-count\">({{ pagination.totalResults }} items)</span></span></script><!-- Desktop - Results - Items --><scripttype=\"text/template\"name=\"Desktop - Results - Items\"target=\".searchspring-container .searchspring-results .product_row, #PF_maincontainer .searchspring-results .product_row\"><li ng-repeat=\"result in results track by result.uid\" class=\"product_tile\" data-id=\"{{ result.sku }}\"><div ng-if=\"result.isInlineBanner\" class=\"ss-inline-banner\" ng-bind-html=\"result.content | trusted\"></div><div ng-if=\"!result.isInlineBanner\" class=\"product_box\"><div class=\"cat_prod_img\"><span ng-if=\"result.status == \'Out of Stock\' && result.out_of_season == \'false\'\" class=\"stockstatoverlay\">Out Of Stock</span><span ng-if=\"result.status == \'Out of Stock\' && result.out_of_season == \'true\'\" class=\"stockstatoverlay\">Out Of Season</span><a class=\"quicklook-button cboxElement\" href=\"/product/{{ result.urlname }}?quickview=true\" rel=\"#overlay\" style=\"left: 102px;\" intellisuggest><span class=\"quicklook-visible\">Quick View</span><span class=\"visually-hidden\">Opens a dialog</span></a><a ng-href=\"{{ result.url }}\" intellisuggest><imgclass=\"lazy\"id=\"Img_{{ result.uid }}\"ng-src=\"{{ result.thumbnailImageUrl ? result.thumbnailImageUrl : \'//cdn.searchspring.net/ajax_search/img/default_image.png\' }}\"onerror=\"this.src=\'//cdn.searchspring.net/ajax_search/img/default_image.png\';\"alt=\"{{ result.name }}\"title=\"{{ result.name }}\"/></a><div class=\"badge_div\"><imgng-if=\"result.specialBadge\"ng-src=\"{{ result.specialBadge.imageUrl }}\"alt=\"{{ result.specialBadge.name }}\"ng-class=\"{\'left\': result.specialBadge.id == \'283\'}\"class=\"catbadge\"/></div></div><div class=\"info\"><a ng-href=\"{{ result.url }}\" intellisuggest><strong class=\"prod_name\"><h3 ng-if=\"context.catid != \'230\' && context.catid != \'196\' && context.catid != \'267\'\" ng-bind-html=\"result.name | trusted\"></h3><h3 class=\"prod_name_variations\" ng-if=\"context.catid == \'196\' || context.catid == \'267\'\" ng-bind-html=\"result.name | trusted\"></h3><h3 class=\"prod_name_variations\" ng-if=\"context.catid == \'230\'\" ng-bind-html=\"result.name | trusted\"></h3></strong></a><div ng-if=\"!result.ss_price_range && !result.ss_retail_range && !result.ss_child_price_range\" class=\"prod_price\" id=\"price_{{ result.sku }}\"><span class=\"sale-price\">{{ (result.ss_pkg_qty > 1 ? result.ss_pkg_qty : 1) + \' for \' }} ${{ result.price | number:2 }}</span><del ng-if=\"result.msrp && (result.msrp * 1) > (result.price * 1)\">{{ (result.ss_pkg_qty > 1 ? result.ss_pkg_qty : 1) + \' for \' }} ${{ result.msrp | number:2 }}</del></div><div ng-if=\"result.ss_price_range || result.ss_retail_range\" class=\"prod_price\"><span class=\"sale-price\" ng-if=\"result.ss_price_range[0] != result.ss_price_range[1]\">${{ result.ss_price_range[0] | number:2 }} to ${{ result.ss_price_range[1] | number:2 }}</span><span class=\"sale-price\" ng-if=\"result.ss_price_range[0] == result.ss_price_range[1]\">${{ result.ss_price_range[0] | number:2 }}</span><delng-if=\"result.ss_retail_range && (result.ss_price_range[0] != result.ss_retail_range[0]) || (result.ss_price_range[1] != result.ss_retail_range[1])\"><span ng-if=\"result.ss_retail_range[0] != result.ss_retail_range[1]\">${{ result.ss_retail_range[0] | number:2 }} to ${{ result.ss_retail_range[1] | number:2 }}</span><span ng-if=\"result.ss_retail_range[0] == result.ss_retail_range[1]\">${{ result.ss_retail_range[0] | number:2 }}</span></del></div><div ng-if=\"result.ss_child_price_range\" class=\"prod_price\"><span class=\"sale-price\" ng-if=\"result.ss_child_price_range[0] != result.ss_child_price_range[1]\">${{ result.ss_child_price_range[0] | number:2 }} to ${{ result.ss_child_price_range[1] | number:2 }}</span><span class=\"sale-price\" ng-if=\"result.ss_child_price_range[0] == result.ss_child_price_range[1]\">${{ result.ss_child_price_range[0] | number:2 }}</span></div><div class=\"rev-stars\"><div id=\"product_review_{{ result.sku }}\"></div></div><div ng-if=\"result.status == \'Out of Stock\'\" class=\"cat_form\"><adata-overlay-trigger=\"notifyprod\"ng-click=\"notifyEmail($event);\"data-id=\"{{ result.uid }}\"data-sku=\"{{ result.sku }}\"href=\"\"class=\"button_blue f12 bold\"style=\"text-align:center;display: block;border-radius: 0px;width: 180px;margin: 10px auto;padding: 10px 5px;border: 1px solid #6a9c39;color: #ffffff;background: #6a9c39;\">Notify when Available</a></div></div></div></li></script><!-- Mobile - Search Page Title --><script type=\"text/template\" name=\"Mobile - Search Page Title\" module=\"search\" target=\".searchspring-search-count-title\"><span ng-if=\"pagination.totalResults && pagination.totalResults > 1 && slideout.triggered\" class=\"results-title\">We Found {{ pagination.totalResults }} Results {{ q ? (\'for \\u0022\' + q + \'\\u0022\') : \'\' }}</span><span ng-if=\"pagination.totalResults && pagination.totalResults == 1 && slideout.triggered\" class=\"results-title\">We Found 1 Result {{ q ? (\' for \\u0022\' + q + \'\\u0022\') : \'\' }}</span><h6 ng-if=\"blogsOnly\">We could not find any products related to your search for \"{{q}}\", but we did find the following blog content:</h6><h5 ng-if=\"pagination.totalResults && originalQuery\" style=\"font-size: 18px;margin: 8px 0 0;font-weight: 500;\">Search instead for<a href=\"{{originalQuery.url}}\" style=\"font-weight: 500;\">{{originalQuery.value}}</a></h5></script><!-- Mobile - Results & No Results --><script type=\"text/template\" name=\"Mobile - Results &amp; No Results\" module=\"search\" target=\".searchspring-mobile-container\"><div ng-if=\"pagination.totalResults\" class=\"searchspring-results\"><div ng-if=\"merchandising.content.header.length > 0\" id=\"searchspring-merch_header\" ss-merchandising=\"header\"></div><div class=\"pagination_bar\"><div class=\"catsort ss-sorting\"></div><a ng-if=\"facets.length > 0\" slideout class=\"catfilters\">Filters<i class=\"right_arrow\"></i></a><div ng-if=\"filterSummary.length\" id=\"category_filter\" class=\"searchspring-mobile-summary\"></div></div><div ng-if=\"merchandising.content.banner.length > 0\" id=\"searchspring-merch_banner\" ss-merchandising=\"banner\"></div><div class=\"category_products\"><ul class=\"display grid\"></ul></div><div ng-if=\"merchandising.content.footer.length > 0\" id=\"searchspring-merch_footer\" ss-merchandising=\"footer\"></div><div ng-if=\"pagination.totalPages > 1\" class=\"pagination_bar ss-mobile-pagination arial_font\"><!-- mobile pagination target --></div></div><div ng-if=\"pagination.totalResults === 0\" class=\"searchspring-no_results\"></div></script><!-- Mobile - Pagination --><scripttype=\"text/template\"name=\"Mobile - Pagination\"target=\".searchspring-mobile-container .searchspring-results .ss-mobile-pagination, .searchspring-mobile-finder_container .searchspring-results .ss-mobile-pagination\"><div class=\"paging_mid\"><a ng-if=\"pagination.previous\" ng-href=\"{{ pagination.previous.url }}\"><img src=\"//h2.commercev3.net/cdn0.brecks.com/images/paginationarrowleft_new.png\" alt=\"\" /></a><div class=\"page_stat\">{{ pagination.currentPage }} of {{ pagination.totalPages }}</div>&nbsp;<a ng-if=\"pagination.next\" ng-href=\"{{ pagination.next.url }}\"><img src=\"//h2.commercev3.net/cdn0.brecks.com/images/paginationarrowright_new.png\" alt=\"\" /></a></div><div class=\"paging_left\"></div><div class=\"paging_right\"><span class=\"show-all-less\"><astyle=\"text-decoration:underline; font-size:18px;\"ng-if=\"pagination.totalPages > 1 && pagination.perPage != 500\"ng-click=\"pagination.perPage = n\"ng-repeat=\"n in [500]\">View All</a><astyle=\"text-decoration:underline; font-size:18px;\"ng-if=\"pagination.totalResults > 24 && pagination.totalPages == 1 || pagination.perPage == 500\"ng-click=\"pagination.perPage = n\"ng-repeat=\"n in [24]\">View Less</a></span></div></script><!-- Mobile - Gardeners Favourite - Item --><script type=\"text/template\" name=\"Mobile - Results - Items\" target=\".searchspring-results .grid .catheroprod\"><div ng-repeat=\"result in gardenersFavourite\" class=\"hero_product_box\"><h3 class=\"hprodtitle cabin_font color_green text_uppercase\">Gardeners\' Favourite</h3><div class=\"hprodimage\"><a ng-href=\"{{ result.url }}\" intellisuggest><imgclass=\"hprod_img lazy\"id=\"product_image-{{ result.uid }}\"ng-src=\"{{ result.imageUrl ? result.imageUrl : \'//cdn.searchspring.net/ajax_search/img/default_image.png\' }}\"onerror=\"this.src=\'//cdn.searchspring.net/ajax_search/img/default_image.png\';\"alt=\"{{ result.name }}\"title=\"{{ result.name }}\"/></a></div><div class=\"hprod_info\"><a ng-href=\"{{ result.url }}\" intellisuggest class=\"hprod_name\"><span class=\"color_black\" ng-bind-html=\"result.name | trusted\"></span></a><div class=\"hprod_reviews arial_font\"><div id=\"product_review_{{ result.sku }}\"></div></div><span class=\"hprod_description arial_font char_limitprod\"><span class=\"description_text\" ng-bind-html=\"result.description | trusted\"></span><a ng-href=\"{{ result.url }}\" intellisuggest>more</a></span><div class=\"hprod_price arial_font\" id=\"price_{{ result.sku }}\"><div class=\"ss-mobile-price-block\"></div></div><div class=\"hero_cart_btn\"><div class=\"ss-mobile-button-block\"></div></div></div></div></script><!-- Mobile - Results - Items --><scripttype=\"text/template\"name=\"Mobile - Results - Items\"target=\".searchspring-mobile-container .searchspring-results .category_products .grid, .searchspring-mobile-finder_container .searchspring-results .category_products .grid\"><li ng-repeat=\"result in results track by result.uid\"><div class=\"product_box\"><div class=\"cprodimage\"><a ng-href=\"{{ result.url }}\" intellisuggest><imgclass=\"cat_prod_img lazy\"id=\"product_image-{{ result.uid }}\"ng-src=\"{{ result.thumbnailImageUrl ? result.thumbnailImageUrl : \'//cdn.searchspring.net/ajax_search/img/default_image.png\' }}\"onerror=\"this.src=\'//cdn.searchspring.net/ajax_search/img/default_image.png\';\"alt=\"{{ result.name }}\"title=\"{{ result.name }}\"/></a></div><div class=\"cat_prod_info\"><a href=\"{{ result.url }}\" intellisuggest title=\"{{ result.name }}\" class=\"Cprod_name arial_font f16\" ng-bind-html=\"result.name | trusted\"></a><div class=\"Cprod_reviews\" style=\"height:19px;\"><div id=\"product_review_{{ result.sku }}\"></div></div><div class=\"Cprod_price arial_font\" id=\"price_{{ result.uid }}\"><div class=\"ss-mobile-price-block\"></div></div><div class=\"ss-mobile-button-block\"></div></div></div></li></script><!-- Mobile Button Block (add to cart, etc...) --><script type=\"text/template\" name=\"Sort By\" target=\".searchspring-results .ss-mobile-button-block\"><div class=\"form\" ng-if=\"result.status == \'Out of Stock\'\"><div class=\"oosoverlay\" ng-click=\"goToUrl(result.url)\" intellisuggest><span class=\"oosimgoverlay\" ng-if=\"result.out_of_season==\'false\'\">Out of Stock</span><span class=\"oosimgoverlay\" ng-if=\"result.out_of_season==\'true\'\">Out of Season</span></div><aclass=\"button_green text_uppercase fjalla_font\"ng-click=\"notifyEmail($event);$event.preventDefault();\"data-overlay-trigger=\"notifyprod\"data-id=\"{{ result.uid }}\"data-sku=\"{{ result.sku }}\"style=\"display: block; padding: 5px; text-align: center;\">Notify When Available</a></div><div class=\"form\" ng-if=\"result.status != \'Out of Stock\'\"><div class=\"more-link\" ng-if=\"(result.ss_price_range || result.ss_gift_cert)\"><inputtype=\"button\"name=\"addtocart_submit\"class=\"button_red text_uppercase fjalla_font\"value=\"Select Options\"style=\"padding: 10px 3px;\"ng-click=\"goToUrl(result.url)\"intellisuggest/></div><formng-if=\"!result.ss_price_range && result.ss_gift_cert == \'false\'\"method=\"post\"action=\"index.php\"name=\"product_form\"id=\"product{{ result.uid }}_form\"><input type=\"hidden\" name=\"action\" value=\"AddCart\" /><div class=\"qty-line\" ng-bind-html=\"result.qty_input | trusted\"></div><input type=\"hidden\" id=\"hidden_price_{{ result.uid }}\" value=\"{{ result.price }}\" /><input type=\"hidden\" name=\"prod_id\" value=\"{{ result.uid }}\" /><input ng-if=\"context.catid\" type=\"hidden\" name=\"cat_id\" value=\"{{ context.catid }}\" /><input type=\"hidden\" name=\"sku\" value=\"{{ result.sku }}\" /><input type=\"submit\" name=\"addtocart_submit\" class=\"button_red text_uppercase fjalla_font addtoCart\" value=\"Add to Cart\" /></form></div></script><!-- Mobile Price Block --><script type=\"text/template\" name=\"Sort By\" target=\".searchspring-results .ss-mobile-price-block\"><div ng-if=\"!result.ss_price_range && !result.ss_retail_range && !result.ss_child_price_range && !result.ss_child_retail_range\"><span class=\"color_red f16 arial_font\">{{ result.ss_pkg_qty && (result.ss_pkg_qty * 1 >= 1) ? (result.ss_pkg_qty + \' for \' ) : \'\' }}<!--<del ng-if=\"result.msrp && (result.msrp * 1) > (result.price * 1)\">${{ result.msrp | number:2 }}</del>-->${{ result.price | number:2 }}</span><del ng-if=\"result.msrp && (result.msrp * 1) > (result.price * 1)\">{{ (result.ss_pkg_qty > 1 ? result.ss_pkg_qty : 1) + \' for \' }} ${{ result.msrp | number:2 }}</del></div><div ng-if=\"result.ss_price_range\" class=\"f16 color_red\"><span class=\"sale-price\" ng-if=\"result.ss_price_range[0] != result.ss_price_range[1]\">${{ result.ss_price_range[0] | number:2 }} to ${{ result.ss_price_range[1] | number:2 }}</span><span class=\"sale-price\" ng-if=\"result.ss_price_range[0] == result.ss_price_range[1]\">${{ result.ss_price_range[0] | number:2 }}</span><delng-if=\"result.ss_retail_range && (result.ss_price_range[0] != result.ss_retail_range[0]) || (result.ss_price_range[1] != result.ss_retail_range[1])\"><span ng-if=\"result.ss_retail_range[0] != result.ss_retail_range[1]\">${{ result.ss_retail_range[0] | number:2 }} to ${{ result.ss_retail_range[1] | number:2 }}</span><span ng-if=\"result.ss_retail_range[0] == result.ss_retail_range[1]\">${{ result.ss_retail_range[0] | number:2 }}</span></del></div><div ng-if=\"result.ss_child_price_range\" class=\"f16 color_red\"><span class=\"sale-price\" ng-if=\"result.ss_child_price_range[0] != result.ss_child_price_range[1]\">${{ result.ss_child_price_range[0] | number:2 }} to ${{ result.ss_child_price_range[1] | number:2 }}</span><span class=\"sale-price\" ng-if=\"result.ss_child_price_range[0] == result.ss_child_price_range[1]\">${{ result.ss_child_price_range[0] | number:2 }}</span><delng-if=\"result.ss_child_retail_range && (result.ss_child_price_range[0] != result.ss_child_retail_range[0]) || (result.ss_child_price_range[1] != result.ss_child_retail_range[1])\"><span ng-if=\"result.ss_child_retail_range[0] != result.ss_child_retail_range[1]\">${{ result.ss_child_retail_range[0] | number:2 }} to ${{ result.ss_child_retail_range[1] | number:2 }}</span><span ng-if=\"result.ss_child_retail_range[0] == result.ss_child_retail_range[1]\">${{ result.ss_child_retail_range[0] | number:2 }}</span></del></div></script><!-- Sort By --><script type=\"text/template\" name=\"Sort By\" target=\".searchspring-results .ss-sorting\"><form name=\"category_sort\"><label ng-if=\"!slideout.triggered\" style=\"display: inline-block;\">Sort by:</label><strong ng-if=\"slideout.triggered\">Sort:</strong><select id=\"range\" name=\"range\" ng-model=\"sorting.current\" ng-options=\"option.label for option in sorting.options\"></select></form></script><!-- No Results --><script type=\"text/template\" name=\"No Results\" target=\".searchspring-no_results\"><div class=\"ss-no-results-wrapper\"><div class=\"ss-no-results-container\"><h3 ng-if=\"!q\" class=\"ss-title ss-no-results-title\">No results found.</h3><p ng-if=\"originalQuery\" class=\"ss-did-you-mean\">Search instead for<a href=\"{{originalQuery.url}}\">{{originalQuery.value}}</a></p><p ng-if=\"didYouMean.query.length && !originalQuery\" class=\"ss-did-you-mean\">Did you mean<a href=\"{{ location().remove(context.search).add(context.search, didYouMean.query).url() }}\">{{ didYouMean.query }}</a>?</p></div><div ng-if=\"filterSummary.length\" class=\"ss-mobile-summary\"><divng-if=\"filterSummary.length\"class=\"sort_row\"ng-class=\"{ \'searchspring-summary\': !context.mobile, \'searchspring-mobile-summary\': context.mobile }\"style=\"padding: 5px 10px;\"></div><div ng-if=\"facets.length === 0\" class=\"ss-filter-messages\"></div></div><div class=\"ss-no-results-container\"><h4 class=\"ss-title ss-sub-title\">Suggestions</h4><ul class=\"ss-suggestion-list\"><li>Check for misspellings.</li><li>Remove possible redundant keywords (i.e., \"products\").</li><li>Use other words to describe what you are searching for.</li></ul><p>Still can\'t find what you\'re looking for?<a href=\"/contact\">Contact us</a>.</p><div class=\"ss-contact ss-location\"><h4 class=\"ss-title ss-sub-title\">Mailing Address</h4><p>Breck\'s Bulbs.<br />Customer Service<br />P.O. Box 3979<br />Lawrenceburg, IN 47025-3979</p></div><div class=\"ss-contact ss-phone\"><h4 class=\"ss-title ss-sub-title\">Call Us</h4><p><strong>Order Phone:</strong>(513) 354-1511<br /><strong>Customer Service Phone:</strong>(513) 354-1512<br /><strong>Fax:</strong>(513) 354-1505<br /></p></div><div class=\"ss-contact ss-email\"><h4 class=\"ss-title ss-sub-title\">Email</h4><p><a href=\"mailto:service@brecks.com\">service@brecks.com</a></p></div></div></div><div class=\"ss_right_content\"><img alt=\"Brecks Gifts Logo\" src=\"https://h2.commercev3.net/cdn.brecks.com/images/BrecksGifts_Logo-Master_New071123.jpg\" /><ul><li><a href=\"https://www.brecksgifts.com/category/amaryllislovers1?utm_source=BR&utm_medium=banner&utm_campaign=no-search-results-amaryllis\"><img alt=\"Shop Amaryllis\" src=\"https://h2.commercev3.net/cdn.brecks.com/images/93620_93621_Elvas_Amaryllis_Single_Duo_1227_BG.jpg\" /><div class=\"ss_inner_box\"><p>Shop Amaryllis</p></div></a></li><li><a href=\"https://www.brecksgifts.com/category/seasonal_decor?utm_source=BR&utm_medium=banner&utm_campaign=no-search-results-decor\"><img alt=\"Shop Decor\" src=\"https://h2.commercev3.net/cdn.brecks.com/images/Egret-3.jpg\" /><div class=\"ss_inner_box\"><p>Shop Decor</p></div></a></li><li><a href=\"https://www.brecksgifts.com/category/food-?utm_source=BR&utm_medium=banner&utm_campaign=no-search-results-food\"><img alt=\"Shop Food\" src=\"https://h2.commercev3.net/cdn.brecks.com/images/92025_Garden_Shed_Candy_Gift_B_BG.jpg\" /><div class=\"ss_inner_box\"><p>Shop Food</p></div></a></li><li><a href=\"https://www.brecksgifts.com/category/bulb-garden?utm_source=BR&utm_medium=banner&utm_campaign=no-search-results-bulb-gardens\"><img alt=\"Shop Bulb Gardens\" src=\"https://h2.commercev3.net/cdn.brecks.com/images/93607_NEW_8_Bulb_Garden_1362_BG.jpg\" /><div class=\"ss_inner_box\"><p>Shop Bulb Gardens</p></div></a></li></ul></div><div class=\"recommended-products\" ss-personalized-recommendations profile=\"no-results\" shopperId=\"{{context.shopper.id}}\"></div></script><!-- Slideout Menu --><script type=\"text/template\" name=\"Slideout Menu\" slideout=\"\"><div ng-if=\"facets.length > 0\" id=\"searchspring-slideout_header\"><h4>Refine</h4><a class=\"searchspring-slideout_button\" slideout></a></div><div ng-if=\"facets.length > 0\" id=\"searchspring-slideout_facets\" ng-swipe-left=\"slideout.toggleSlideout()\"><div class=\"searchspring-facets\"></div></div></script><style> .test{}.prod_name_variations {font-size: 18px;}.prod_name h3 {font-size: 1.5em;}</style> <style name=\"No results styles\"> .ss-help {font-size: 1.3em;}@media (min-width: 768px) {.no-results-wrapper {display: inline-block;/*width: 47%;*/vertical-align: top;/*margin-right: 5%;*/}.no-results-img-wrapper {display: inline-block;width: 47%;}.no-results-img-wrapper a img {width: 100%;}}@media (max-width: 767px) {.no-results-wrapper {display: block;width: 100%;}.no-results-img-wrapper {/* display: none; */display: block;width: 100%;}.no-results-img-wrapper a img {width: 100%;}.ss-hide-mobile {display: none;}.no-results-wrapper .ss-mobile-title {margin: 1em 0 0.5em 0;}.no-results-wrapper .suggestion-list,.no-results-wrapper .ss-mobile-content {margin: 0.5em 0;}}</style> <style name=\"Slideout Facet Styles\"> .ss-slideout-button {background-color: #f0f2e3;border: 1px solid #5c7615;width: 100%;height: 40px;text-align: center;margin: 0 0 20px 0;position: relative;cursor: pointer;border-radius: 3px;}.ss-slideout-button .ss-slideout-button-label {line-height: 40px;font-size: 16px;text-transform: uppercase;color: #282828;font-weight: bold;}.ss-slideout-button .ss-slideout-button-icon {width: 20px;height: 20px;position: absolute;top: 0;bottom: 0;left: 10px;margin: auto;background-repeat: no-repeat;background-position: center center;background-image: url(\"data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 256 256\' preserveAspectRatio=\'xMinYMid\'%3E%3Cpath fill=\'%23282828\' d=\'M 118.00,104.00 C 118.00,104.00 117.00,87.00 117.00,87.00 117.00,87.00 117.00,31.00 117.00,31.00 117.01,26.17 116.98,20.04 120.43,16.23 125.02,11.14 133.55,12.37 137.15,18.04 139.22,21.31 138.99,25.29 139.00,29.00 139.00,29.00 139.00,134.00 139.00,134.00 139.00,134.00 118.00,134.00 118.00,134.00 118.00,134.00 118.00,104.00 118.00,104.00 Z M 188.00,29.00 C 188.08,22.45 189.17,14.55 197.00,13.23 208.63,11.27 209.99,22.54 210.00,31.00 210.00,31.00 210.00,79.00 210.00,79.00 210.00,79.00 199.00,78.03 199.00,78.03 199.00,78.03 188.00,79.00 188.00,79.00 188.00,79.00 188.00,29.00 188.00,29.00 Z M 47.00,29.00 C 47.06,24.09 47.61,18.85 52.11,15.85 58.28,11.75 65.77,15.20 68.01,22.00 69.35,26.09 69.00,32.58 69.00,37.00 69.00,37.00 69.00,62.00 69.00,62.00 69.00,62.00 58.00,61.18 58.00,61.18 58.00,61.18 47.00,62.00 47.00,62.00 47.00,62.00 47.00,29.00 47.00,29.00 Z M 66.00,69.36 C 88.90,77.07 88.77,112.50 61.00,117.38 39.71,121.13 25.85,96.53 36.61,79.01 40.38,72.88 46.23,70.07 53.00,68.47 57.89,67.78 61.25,67.76 66.00,69.36 Z M 204.00,133.53 C 180.87,137.90 167.11,113.44 177.61,96.00 181.96,88.78 188.14,86.20 196.00,84.47 227.47,80.80 234.91,127.70 204.00,133.53 Z M 69.00,123.00 C 69.00,123.00 69.00,225.00 69.00,225.00 68.99,230.05 68.72,237.80 65.49,241.89 61.06,247.51 52.63,246.97 48.93,240.95 46.87,237.59 47.01,232.81 47.00,229.00 47.00,229.00 47.00,123.00 47.00,123.00 47.00,123.00 69.00,123.00 69.00,123.00 Z M 150.01,152.00 C 158.06,165.66 149.93,185.88 134.00,188.67 129.14,189.53 121.45,189.23 117.00,187.00 97.42,177.21 98.75,146.25 123.00,140.47 134.11,138.91 144.02,141.84 150.01,152.00 Z M 199.00,140.92 C 199.00,140.92 210.00,140.00 210.00,140.00 210.00,140.00 210.00,229.00 210.00,229.00 209.99,233.30 210.14,238.21 207.30,241.78 203.24,246.87 194.76,246.87 190.70,241.78 188.05,238.46 188.02,234.02 188.00,230.00 188.00,230.00 188.00,140.00 188.00,140.00 188.00,140.00 199.00,140.92 199.00,140.92 Z M 127.00,195.91 C 127.00,195.91 139.00,195.00 139.00,195.00 139.00,195.00 139.00,231.00 139.00,231.00 138.91,238.31 136.28,247.05 127.00,245.62 119.05,244.39 117.09,236.83 117.00,230.00 117.00,230.00 117.00,195.00 117.00,195.00 117.00,195.00 127.00,195.91 127.00,195.91 Z\'/%3E%3C/svg%3E\");}#searchspring-slideout_facets .PFfilterlist {display: block;background: #fff;min-height: 0px;margin: 0;padding: 0;vertical-align: top;font-size: 15px;border: none;border-radius: 3px;}#searchspring-slideout_facets .PFfilterlist h3 {font-weight: 500;}#searchspring-slideout_container #searchspring-slideout_header {/* position: relative; *//* padding: 10px 65px 10px 10px; *//* update bg color */background-color: #d8e595;}.ss-options li a {/* color: #282828; *//* add text decoration */text-decoration: none;}#searchspring-slideout_container #searchspring-slideout_facets .searchspring-facets .filtertitle {/* background: #f0f2e3; *//* color: #282828; *//* update border colors */border-bottom: 1px solid #d8e595;border-top: 1px solid #d8e595;/* padding: 10px 35px 10px 10px; *//* margin: 0 -10px; */}</style> <style name=\"finder search header\"> .finder-filter-summary .search-page-title {display: inline;margin-left: 20px;}</style> <style name=\"badges\"> .badge_div {width: 100%;}img.catbadge.right {right: 0;left: unset;}</style> <style name=\"Product Description Header\"> .ss-description_header {text-align: center;}</style> <style> /* Recommendations - Vertical Standard */.ss-recs-standard.ss-recs-vertical {margin: 20px 0;}.ss-recs-standard.ss-recs-vertical .ss-recs-title {margin: 0 0 20px 0;font-size: 20px;text-align: left;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item {margin: 0 0 20px 0;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item:last-child {margin-bottom: 0;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item,body #page .ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item * {-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner {display: -webkit-box;display: -webkit-flex;display: -ms-flexbox;display: flex;-webkit-flex-flow: row wrap;-ms-flex-flow: row wrap;flex-flow: row wrap;-webkit-box-align: center;-webkit-align-items: center;-ms-flex-align: center;-ms-grid-row-align: center;align-items: center;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner > div {display: block;width: auto;-webkit-box-flex: 0;-webkit-flex: 0 1 auto;-ms-flex: 0 1 auto;flex: 0 1 auto;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-image {width: 33.3333%;line-height: 0;margin: 0 10px 0 0;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-image .ss-image-wrapper {padding-bottom: 115%;height: 0;position: relative;background-repeat: no-repeat;background-position: center center;background-size: cover;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-image .ss-image-wrapper,body #page .ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-image .ss-image-wrapper img {display: block;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-image .ss-image-wrapper img {position: absolute;width: 1px;height: 1px;padding: 0;margin: -1px;overflow: hidden;clip: rect(0, 0, 0, 0);}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-details {-webkit-box-flex: 1;-webkit-flex: 1 1 0%;-ms-flex: 1 1 0%;flex: 1 1 0%;margin: 0;text-align: left;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-details > * {margin: 0 0 10px 0;}body #page .ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-details > *:last-child {margin-bottom: 0;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-details p,body #page .ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-details a,body #page .ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-details span {font-size: 16px;font-weight: bold;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-details p,body #page .ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-details a {color: #282828;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-details .quicklook-button {display: inline-block !important;padding: 0;background: transparent;border: 0;text-align: center;opacity: 1;position: static;}.ss-recs-standard.ss-recs-vertical.ss-recs-item-container.ss-recs-item.ss-recs-item-inner.ss-recs-item-details.quicklook-button.quicklook-visible {font-family: Arial;font-weight: 700;color: #990000;line-height: 1.2;}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-details .quicklook-button:hover {text-decoration: none;}@media only screen and (max-width: 1023px) {.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-image {width: 100%;margin: 0 0 10px 0;}}@media only screen and (max-width: 767px) {.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-image {width: 33.3333%;margin: 0 10px 0 0;}}@media only screen and (max-width: 380px) {.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item .ss-recs-item-inner .ss-recs-item-image {width: 100%;margin: 0 0 10px 0;}}.ss-recs-standard.ss-recs-vertical .ss-recs-item-container .ss-recs-item-inner {display: flex !important;flex-flow: row wrap !important;}.ss-recs-item-image {display: block !important;width: 33.3333% !important;margin: 0px 10px 10px 0px !important;}.ss-recs-item-details {flex: 1 1 0% !important;text-align: left !important;}@media (max-width: 767px) {.ss-no-results-wrapper {display: inline-block;width: 100%;}.ss_right_content {width: 100%;display: inline-block;border: 1px solid #000;vertical-align: top;margin-top: auto;text-align: center;padding: 0px auto;}.ss-no-results-wrapper {display: inline-block;width: 100%;}p.ss-did-you-mean {margin: 0;}.ss-contact.ss-email {display: none;}.ss-contact.ss-phone {display: none;}.ss-contact.ss-location {display: none;}}@media (min-width: 767px) {.ss_right_content {width: 60%;display: inline-block;border: 1px solid #000;vertical-align: top;margin-top: auto;text-align: center;padding: 10px 0;}.ss-no-results-wrapper {display: inline-block;width: 39%;}}.ss_right_content ul {margin: 0;padding: 0;}.ss_right_content ul li {display: inline-block;vertical-align: top;width: 45%;height: auto;margin: 6px 1.5%;overflow: hidden;position: relative;}.ss_right_content ul li img {max-width: 100%;height: auto;width: 100%;}.ss_inner_box {position: absolute;z-index: 10;background: rgba(184, 225, 185, 0.8);width: 96.5%;color: #000;bottom: 4px;font-size: 16px;font-weight: 500;padding: 5px 5px;height: 44px;display: table;}.ss_inner_box p {display: table-cell;vertical-align: middle;}</style> ')