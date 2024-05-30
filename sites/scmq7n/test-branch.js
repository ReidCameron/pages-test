window.SearchSpringInit = function(){
console.log("[SS]", "Preview Working")
var self = this;

// springboard generated variables
var modules = {};
modules.enabled = true;

// springboard generated variables for autocomplete/default
modules.autocomplete = {
  input: '.searchspring-ac',
  spellCorrection: 'integrated',
  language: 'en',
  action: '',
  autoPosition: false,
  limit: 4,
  trendingSearches: true,
  trendingLimit: 6,
  trendingVerbiage: 'Popular Searches'
};

this.importer.include('autocomplete2', modules.autocomplete);

this.importer.include('facet-slider');

this.on('afterSearch', function($scope) {
  if ($scope.facets && $scope.facets.length) {
    // Remove slider if ranges are the same
    for (var i = $scope.facets.length - 1; i >= 0; i--) {
      if ($scope.facets[i].type == 'slider' && $scope.facets[i].range[0] == $scope.facets[i].range[1]) {
        $scope.facets.splice(i, 1);
      }
    }
    
    $scope.typeOf = function(value) {
    	if(Array.isArray(value)) {
    		return 'array';
    	} else {
    		return typeof value;
    	}
  	}

    // Update slider layout
    $scope.facets.updateSlider = function(type) {
      if (type == 'slider') {
        setTimeout(function() {
          $scope.$broadcast('rzSliderForceRender');
        });
      }
    }
  }
});


this.on('afterSearch', function($scope) {
  angular.forEach($scope.facets, function(facet) {
    // Create different limits for different facet types
    // For palette and grid types, this makes sure boxes fill the last row
    var facetType = (facet.type == 'palette' || facet.type == 'grid') ? true : false;
    facet.limitCount = facetType ? 16 : 12;
  });
});


this.on('afterBootstrap', function($scope) {
  // Add loading div for an accurate fixed position
  var loadingID = 'searchspring-loading';
  var loadingContainer = document.getElementById(loadingID);

  if (!loadingContainer && !$scope.moduleName) {
    angular.element(document.querySelector('body')).append('<div id="' + loadingID + '"></div>');
  }
});

this.on('afterSearch', function($scope) {
  // Check if there is more than one page (for head title logic)
  $scope.pagination.multiplePages = true;
  if ($scope.pagination.totalResults <= $scope.pagination.perPage) {
    $scope.pagination.multiplePages = false;
  }

  // Set default image url
  $scope.results.defaultImage = '//cdn.searchspring.net/ajax_search/img/default_image.png';

  angular.forEach($scope.results, function(result) {
    // If no thumbnail image, set default image
    if (!result.imageUrl) {
      result.imageUrl = $scope.results.defaultImage;
    }

    // Pre-load images and check for loading errors
    var ssResultsImage = new Image();
    ssResultsImage.src = result.imageUrl;

    // If image errors, load default image instead
    ssResultsImage.onerror = function() {
      result.imageUrl = $scope.results.defaultImage;
      $scope.$evalAsync();
    }
  });
});


// springboard generated variables for slideout/default
modules.slideout = {
  width: 991
};

this.importer.include('slideout', modules.slideout);


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

// inline banner code
this.on('afterSearch', function($scope) {
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

}
SearchSpring.Catalog.templates.promises.receive.resolve('<!-- Stylesheet --><link rel=\\"stylesheet\\" type=\\"text/css\\" href=\\"//cdn.searchspring.net/ajax_search/sites/scmq7n/css/scmq7n.css\\" /><!-- AutoComplete --><script type=\\"text/template\\" name=\\"AutoComplete\\" target=\\"[ss-autocomplete]\\">\\t<div class=\\"ss-ac-container ss-flex-wrap\\" ng-show=\\"ac.visible\\" ng-class=\\"{\\'no-terms\\': !ac.terms.length, \\'no-results\\': !ac.results.length}\\">\\t\\t<div class=\\"ss-ac-terms\\" ng-show=\\"ac.terms\\">\\t\\t\\t<h5 ng-if=\\"ac.trendingVerbiageVisible\\" class=\\"ss-ac-terms-heading\\">{{ ac.trendingVerbiage }}</h5>\\t\\t\\t<div class=\\"ss-list\\">\\t\\t\\t\\t<div ng-repeat=\\"term in ac.terms | limitTo:4\\" class=\\"ss-list-option\\" ng-class=\\"{\\'ss-active\\': term.active}\\">\\t\\t\\t\\t\\t<a ng-bind-html=\\"term.label | trusted\\" ss-no-ps ss-nav-selectable ng-focus=\\"term.preview()\\" href=\\"{{ term.url }}\\" class=\\"ss-list-link\\"></a>\\t\\t\\t\\t</div>\\t\\t\\t</div>\\t\\t</div>\\t\\t<div ng-if=\\"ac.results.length\\" class=\\"ss-ac-content ss-flex-wrap\\">\\t\\t\\t<div class=\\"ss-ac-facets\\" ng-show=\\"ac.facets\\">\\t\\t\\t\\t<div class=\\"ss-ac-facets-row\\">\\t\\t\\t\\t\\t<div\\t\\t\\t\\t\\t\\tng-repeat=\\"facet in ac.facets | filter: { type: \\'!slider\\' } | limitTo: 3\\"\\t\\t\\t\\t\\t\\tng-switch=\\"facet.type\\"\\t\\t\\t\\t\\t\\tng-if=\\"facet.values.length\\"\\t\\t\\t\\t\\t\\tid=\\"ss-ac-{{ facet.field }}\\"\\t\\t\\t\\t\\t\\tclass=\\"ss-ac-facet-container ss-ac-facet-container-{{ (facet.type && (facet.type != \\'hierarchy\\' || facet.type != \\'slider\\')) ? facet.type : \\'list\\' }}\\"\\t\\t\\t\\t\\t>\\t\\t\\t\\t\\t\\t<h4 class=\\"ss-title\\">{{ facet.label }}</h4>\\t\\t\\t\\t\\t\\t<div ng-switch-when=\\"grid\\" class=\\"ss-grid ss-flex-wrap\\">\\t\\t\\t\\t\\t\\t\\t<div ng-repeat=\\"value in facet.values | limitTo:6\\" class=\\"ss-grid-option\\" ng-class=\\"{\\'ss-active\\': value.active}\\">\\t\\t\\t\\t\\t\\t\\t\\t<a href=\\"{{ value.url }}\\" ss-no-ps ss-nav-selectable ng-focus=\\"value.preview()\\" class=\\"ss-grid-link\\">\\t\\t\\t\\t\\t\\t\\t\\t\\t<div class=\\"ss-grid-block\\"></div>\\t\\t\\t\\t\\t\\t\\t\\t\\t<div class=\\"ss-grid-label\\">{{ value.label }}</div>\\t\\t\\t\\t\\t\\t\\t\\t</a>\\t\\t\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t\\t\\t<div ng-switch-when=\\"palette\\" class=\\"ss-palette ss-flex-wrap\\">\\t\\t\\t\\t\\t\\t\\t<div ng-repeat=\\"value in facet.values | limitTo:6\\" class=\\"ss-palette-option\\" ng-class=\\"{\\'ss-active\\': value.active}\\">\\t\\t\\t\\t\\t\\t\\t\\t<a href=\\"{{ value.url }}\\" ss-no-ps ss-nav-selectable ng-focus=\\"value.preview()\\" class=\\"ss-palette-link\\" alt=\\"{{ value.label }}\\">\\t\\t\\t\\t\\t\\t\\t\\t\\t<div class=\\"ss-palette-block\\">\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t<div\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"ss-palette-color ss-palette-color-{{ value.value | handleize }}\\"\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tng-style=\\"{\\'background-color\\': (value.value | handleize)}\\"\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t></div>\\t\\t\\t\\t\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t\\t\\t\\t\\t\\t<div class=\\"ss-palette-label\\">{{ value.label }}</div>\\t\\t\\t\\t\\t\\t\\t\\t</a>\\t\\t\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t\\t\\t<div ng-switch-default class=\\"ss-list\\">\\t\\t\\t\\t\\t\\t\\t<div ng-repeat=\\"value in facet.values | limitTo:5\\" class=\\"ss-list-option\\" ng-class=\\"{\\'ss-active\\': value.active}\\">\\t\\t\\t\\t\\t\\t\\t\\t<a href=\\"{{ value.url }}\\" ss-no-ps ss-nav-selectable ng-focus=\\"value.preview()\\" class=\\"ss-list-link\\">{{ value.label }}</a>\\t\\t\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t</div>\\t\\t\\t\\t<div ng-if=\\"ac.merchandising.content.left.length > 0\\" id=\\"ss-ac-merch-left\\" class=\\"ss-ac-merchandising\\" ss-merchandising=\\"ac.left\\"></div>\\t\\t\\t</div>\\t\\t\\t<div class=\\"ss-ac-results\\">\\t\\t\\t\\t<h4 class=\\"ss-title\\">Product Suggestions</h4>\\t\\t\\t\\t<div ng-if=\\"ac.merchandising.content.header.length > 0\\" id=\\"ss-ac-merch-header\\" class=\\"ss-ac-merchandising\\" ss-merchandising=\\"ac.header\\"></div>\\t\\t\\t\\t<div ng-if=\\"ac.merchandising.content.banner.length > 0\\" id=\\"ss-ac-merch-banner\\" class=\\"ss-ac-merchandising\\" ss-merchandising=\\"ac.banner\\"></div>\\t\\t\\t\\t<div ng-if=\\"ac.results.length\\" class=\\"ss-ac-item-container ss-flex-wrap\\">\\t\\t\\t\\t\\t<article class=\\"ss-ac-item\\" ng-repeat=\\"result in ac.results | limitTo:ac.pagination.perPage\\">\\t\\t\\t\\t\\t\\t<div ng-if=\\"result.isInlineBanner\\" class=\\"ss-inline-banner\\" ng-bind-html=\\"result.content | trusted\\"></div>\\t\\t\\t\\t\\t\\t<a ng-if=\\"!result.isInlineBanner\\" ng-href=\\"{{ result.url }}\\" ss-no-ps ss-nav-selectable>\\t\\t\\t\\t\\t\\t\\t<div class=\\"ss-ac-item-image\\">\\t\\t\\t\\t\\t\\t\\t\\t<div\\t\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"ss-image-wrapper\\"\\t\\t\\t\\t\\t\\t\\t\\t\\tng-style=\\"{\\'background-image\\': \\'url(\\' + (result.thumbnailImageUrl ? result.thumbnailImageUrl : \\'//cdn.searchspring.net/ajax_search/img/default_image.png\\') + \\')\\'}\\"\\t\\t\\t\\t\\t\\t\\t\\t\\talt=\\"{{ result.name }}\\"\\t\\t\\t\\t\\t\\t\\t\\t\\ttitle=\\"{{ result.name }}\\"\\t\\t\\t\\t\\t\\t\\t\\t></div>\\t\\t\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t\\t\\t\\t<div class=\\"ss-ac-item-details\\">\\t\\t\\t\\t\\t\\t\\t\\t<p class=\\"ss-ac-item-name\\">{{ result.name | truncate:40:\\'&hellip;\\' }}</p>\\t\\t\\t\\t\\t\\t\\t\\t<p class=\\"ss-ac-item-price\\">\\t\\t\\t\\t\\t\\t\\t\\t\\t<span ng-if=\\"result.msrp && (result.msrp * 1) > (result.price * 1)\\" class=\\"ss-ac-item-msrp\\">{{ result.msrp | currency }}</span>\\t\\t\\t\\t\\t\\t\\t\\t\\t<span class=\\"ss-ac-item-regular\\" ng-class=\\"{\\'ss-ac-item-on-sale\\': result.msrp && (result.msrp * 1) > (result.price * 1)}\\">\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t{{ result.price | currency }}\\t\\t\\t\\t\\t\\t\\t\\t\\t</span>\\t\\t\\t\\t\\t\\t\\t\\t</p>\\t\\t\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t\\t\\t</a>\\t\\t\\t\\t\\t</article>\\t\\t\\t\\t</div>\\t\\t\\t\\t<div ng-if=\\"ac.merchandising.content.footer.length > 0\\" id=\\"ss-ac-merch-footer\\" class=\\"ss-ac-merchandising\\" ss-merchandising=\\"ac.footer\\"></div>\\t\\t\\t\\t<div ng-if=\\"!ac.results.length\\" class=\\"ss-ac-no-results\\"><p>No results found for \\"{{ ac.q }}\\". Please try another search.</p></div>\\t\\t\\t</div>\\t\\t\\t<div class=\\"ss-ac-see-more\\">\\t\\t\\t\\t<a href=\\"{{ ac.location.remove(\\'perpage\\').url() }}\\" ng-click=\\"ac.visible = false;\\" class=\\"ss-ac-see-more-link ss-title\\" ss-nav-selectable>\\t\\t\\t\\t\\tSee {{ ac.pagination.totalResults }} {{ ac.breadcrumbs.length > 1 ? \\'filtered\\' : \\'\\' }} result{{ ac.pagination.totalResults > 1 ? \\'s\\' : \\'\\' }} for\\t\\t\\t\\t\\t\\"{{ ac.q }}\\"\\t\\t\\t\\t</a>\\t\\t\\t</div>\\t\\t</div>\\t</div></script><!-- Facets - Range Slider --><script type=\\"text/template\\" name=\\"Facets - Range Slider\\" target=\\".ss-range-slider-container\\">\\t<div ng-if=\\"facet.range[0] != facet.range[1]\\" ss-facet-slider=\\"facet\\" class=\\"ss-range-slider\\"></div>\\t<div ng-if=\\"facet.range[0] != facet.range[1] && facet.facet_active\\" class=\\"ss-range-slider-reset\\">\\t\\t<a ng-if=\\"facet.facet_active\\" ng-href=\\"{{ location().remove(\\'filter\\', facet.field).url() }}\\" class=\\"ss-range-slider-reset-link\\">Reset</a>\\t</div></script><!-- SearchSpring Sidebar --><script type=\\"text/template\\" name=\\"SearchSpring Sidebar\\" module=\\"search\\" target=\\"#searchspring-sidebar\\">\\t<aside ng-if=\\"!slideout.triggered\\" class=\\"ss-sidebar-container\\">\\t\\t<div ng-if=\\"filterSummary.length\\" class=\\"ss-summary\\"></div>\\t\\t<div ng-if=\\"facets.length === 0\\" class=\\"ss-filter-messages\\"></div>\\t\\t<div ng-if=\\"facets.length\\" class=\\"ss-facets\\"></div>\\t</aside></script><!-- Filter Messages --><script type=\\"text/template\\" name=\\"Filter Messages\\" target=\\".ss-filter-messages\\">\\t<p ng-if=\\"pagination.totalResults === 0 && filterSummary.length === 0\\" class=\\"ss-filter-message-content\\">\\t\\tThere are no results to refine. If you need additional help, please try our search \\"\\t\\t<strong>Suggestions</strong>\\t\\t\\".\\t</p>\\t<p ng-if=\\"pagination.totalResults === 0 && filterSummary.length\\" class=\\"ss-filter-message-content\\">\\t\\tIf you are not seeing any results, try removing some of your selected filters.\\t</p>\\t<p ng-if=\\"pagination.totalResults && filterSummary.length === 0\\" class=\\"ss-filter-message-content\\">There are no filters to refine by.</p></script><!-- Facets --><script type=\\"text/template\\" name=\\"Facets\\" target=\\".ss-facets\\">\\t<article\\t\\tng-repeat=\\"facet in facets\\"\\t\\tng-switch=\\"facet.type\\"\\t\\tid=\\"ss-{{ facet.field }}\\"\\t\\tclass=\\"ss-facet-container ss-facet-container-{{ facet.type ? facet.type : \\'list\\' }}\\"\\t\\tng-class=\\"{\\'ss-expanded\\': !facet.collapse, \\'ss-collapsed\\': facet.collapse}\\"\\t>\\t\\t<h4 ng-click=\\"facet.collapse = !facet.collapse\\" class=\\"ss-title ss-pointer\\">{{ facet.label }}</h4>\\t\\t<div class=\\"ss-facet-options\\">\\t\\t\\t<div ng-switch-when=\\"hierarchy\\" class=\\"ss-hierarchy\\">\\t\\t\\t\\t<div\\t\\t\\t\\t\\tng-repeat=\\"value in facet.values | limitTo:facet.overflow.limit\\"\\t\\t\\t\\t\\tclass=\\"ss-hierarchy-option\\"\\t\\t\\t\\t\\tng-class=\\"{\\'ss-hierarchy-current\\': value.active, \\'ss-hierarchy-return\\': value.history && !value.active}\\"\\t\\t\\t\\t>\\t\\t\\t\\t\\t<a ng-if=\\"!value.active\\" ng-href=\\"{{ value.url }}\\" class=\\"ss-hierarchy-link\\">\\t\\t\\t\\t\\t\\t{{ value.label }}\\t\\t\\t\\t\\t\\t<span ng-if=\\"!value.history\\" class=\\"ss-facet-count\\">({{ value.count }})</span>\\t\\t\\t\\t\\t</a>\\t\\t\\t\\t\\t{{ value.active ? value.label : \\'\\' }}\\t\\t\\t\\t</div>\\t\\t\\t</div>\\t\\t\\t<div ng-switch-when=\\"grid\\" class=\\"ss-grid ss-flex-wrap\\">\\t\\t\\t\\t<div ng-repeat=\\"value in facet.values | limitTo:facet.overflow.limit\\" class=\\"ss-grid-option\\" ng-class=\\"{\\'ss-active\\': value.active}\\">\\t\\t\\t\\t\\t<a href=\\"{{ value.url }}\\" class=\\"ss-grid-link\\">\\t\\t\\t\\t\\t\\t<div class=\\"ss-grid-block\\"></div>\\t\\t\\t\\t\\t\\t<div class=\\"ss-grid-label\\">{{ value.label }}</div>\\t\\t\\t\\t\\t</a>\\t\\t\\t\\t</div>\\t\\t\\t</div>\\t\\t\\t<div ng-switch-when=\\"palette\\" class=\\"ss-palette ss-flex-wrap\\">\\t\\t\\t\\t<div ng-repeat=\\"value in facet.values | limitTo:facet.overflow.limit\\" class=\\"ss-palette-option\\" ng-class=\\"{\\'ss-active\\': value.active}\\">\\t\\t\\t\\t\\t<a href=\\"{{ value.url }}\\" class=\\"ss-palette-link\\" alt=\\"{{ value.label }}\\">\\t\\t\\t\\t\\t\\t<div class=\\"ss-palette-block\\">\\t\\t\\t\\t\\t\\t\\t<div class=\\"ss-palette-color ss-palette-color-{{ value.value | handleize }}\\" ng-style=\\"{\\'background-color\\': (value.value | handleize)}\\"></div>\\t\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t\\t\\t<div class=\\"ss-palette-label\\">{{ value.label }}</div>\\t\\t\\t\\t\\t</a>\\t\\t\\t\\t</div>\\t\\t\\t</div>\\t\\t\\t<div ng-switch-when=\\"slider\\" class=\\"ss-range-slider-container\\"></div>\\t\\t\\t<div ng-switch-default class=\\"ss-list\\" ng-class=\\"{\\'ss-scrollbar\\': facet.overflow.remaining != facet.overflow.count}\\">\\t\\t\\t\\t<div ng-repeat=\\"value in facet.values | limitTo:facet.overflow.limit\\" class=\\"ss-list-option\\" ng-class=\\"{\\'ss-active\\': value.active}\\">\\t\\t\\t\\t\\t<a href=\\"{{ value.url }}\\" class=\\"ss-list-link ss-checkbox\\" ng-class=\\"{\\'ss-checkbox-round\\': facet.multiple == \\'single\\'}\\">\\t\\t\\t\\t\\t\\t{{ value.label }}\\t\\t\\t\\t\\t\\t<span class=\\"ss-facet-count\\">({{ value.count }})</span>\\t\\t\\t\\t\\t</a>\\t\\t\\t\\t</div>\\t\\t\\t</div>\\t\\t\\t<div\\t\\t\\t\\tng-if=\\"facet.overflow.set(facet.limitCount).count\\"\\t\\t\\t\\tclass=\\"ss-show-more\\"\\t\\t\\t\\tng-class=\\"{\\'ss-expanded\\': facet.overflow.remaining, \\'ss-collapsed\\': !facet.overflow.remaining}\\"\\t\\t\\t>\\t\\t\\t\\t<a ng-click=\\"facet.overflow.toggle()\\" class=\\"ss-show-more-link ss-pointer\\">Show {{ facet.overflow.remaining ? \\'More\\' : \\'Less\\' }}</a>\\t\\t\\t</div>\\t\\t</div>\\t</article>\\t<div ng-if=\\"merchandising.content.left.length > 0\\" id=\\"ss-merch-left\\" class=\\"ss-merchandising\\" ss-merchandising=\\"left\\"></div></script><!-- Filter Summary --><script type=\\"text/template\\" name=\\"Filter Summary\\" target=\\".ss-summary\\">\\t<div class=\\"ss-summary-container\\">\\t\\t<h4 ng-if=\\"!slideout.triggered && !facets.horizontal\\" class=\\"ss-title\\">Current Filters</h4>\\t\\t<div class=\\"ss-list ss-flex-wrap-center\\">\\t\\t\\t<div ng-if=\\"slideout.triggered || facets.horizontal\\" class=\\"ss-list-option ss-list-title\\">\\t\\t\\t\\t<span class=\\"ss-summary-label\\">Current Filters:</span>\\t\\t\\t</div>\\t\\t\\t<div ng-repeat=\\"filter in filterSummary\\" class=\\"ss-list-option\\">\\t\\t\\t\\t<a href=\\"{{ filter.remove.url }}\\" class=\\"ss-list-link\\">\\t\\t\\t\\t\\t<span class=\\"ss-summary-label\\">{{ filter.filterLabel }}:</span>\\t\\t\\t\\t\\t<span class=\\"ss-summary-value\\">{{ filter.filterValue }}</span>\\t\\t\\t\\t</a>\\t\\t\\t</div>\\t\\t\\t<div class=\\"ss-list-option ss-summary-reset\\">\\t\\t\\t\\t<a href=\\"{{ location().remove(\\'filter\\').remove(\\'rq\\').url() }}\\" class=\\"ss-list-link\\">Clear All</a>\\t\\t\\t</div>\\t\\t</div>\\t</div></script><!-- Pagination --><script type=\\"text/template\\" name=\\"Pagination\\" target=\\".ss-pagination\\">\\t<div class=\\"ss-pagination-row\\">\\t\\t<div ng-if=\\"pagination.previous\\" class=\\"ss-page ss-page-previous\\"><a ng-href=\\"{{ pagination.previous.url }}\\" class=\\"ss-page-link\\">Previous</a></div>\\t\\t<div ng-if=\\"pagination.totalPages > 5 && pagination.currentPage > 3\\" class=\\"ss-page ss-page-first\\">\\t\\t\\t<a ng-href=\\"{{ pagination.first.url }}\\" class=\\"ss-page-link\\">{{ pagination.first.number }}</a>\\t\\t</div>\\t\\t<div ng-if=\\"pagination.totalPages > 5 && pagination.currentPage > 3\\" class=\\"ss-page ss-page-hellip\\">\\t\\t\\t<span class=\\"ss-page-label\\">&hellip;</span>\\t\\t</div>\\t\\t<div ng-repeat=\\"page in pagination.getPages(5)\\" class=\\"ss-page\\" ng-class=\\"{\\'ss-active\\': page.active}\\">\\t\\t\\t<a ng-if=\\"!page.active\\" ng-href=\\"{{ page.url }}\\" class=\\"ss-page-link\\">{{ page.number }}</a>\\t\\t\\t<span ng-if=\\"page.active\\" class=\\"ss-page-label\\">{{ page.number }}</span>\\t\\t</div>\\t\\t<div ng-if=\\"pagination.totalPages > 5 && pagination.currentPage < (pagination.totalPages - 2)\\" class=\\"ss-page ss-page-hellip\\">\\t\\t\\t<span class=\\"ss-page-label\\">&hellip;</span>\\t\\t</div>\\t\\t<div ng-if=\\"pagination.totalPages > 5 && pagination.currentPage < (pagination.totalPages - 2)\\" class=\\"ss-page ss-page-last\\">\\t\\t\\t<a ng-href=\\"{{ pagination.last.url }}\\" class=\\"ss-page-link\\">{{ pagination.last.number }}</a>\\t\\t</div>\\t\\t<div ng-if=\\"pagination.next\\" class=\\"ss-page ss-page-next\\"><a ng-href=\\"{{ pagination.next.url }}\\" class=\\"ss-page-link\\">Next</a></div>\\t</div></script><!-- Results & No Results --><script type=\\"text/template\\" name=\\"Results &amp; No Results\\" module=\\"search\\" target=\\"#searchspring-content\\">\\t<section class=\\"ss-content-container\\">\\t\\t<header class=\\"ss-header-container\\">\\t\\t\\t<h3 ng-if=\\"pagination.totalResults\\" class=\\"ss-title ss-results-title\\">\\t\\t\\t\\tShowing\\t\\t\\t\\t<span ng-if=\\"pagination.multiplePages\\" class=\\"ss-results-count-range\\">{{ pagination.begin }} - {{ pagination.end }}</span>\\t\\t\\t\\t{{ pagination.multiplePages ? \\'of\\' : \\'\\' }}\\t\\t\\t\\t<span class=\\"ss-results-count-total\\">{{ pagination.totalResults }}</span>\\t\\t\\t\\tresult{{ pagination.totalResults == 1 ? \\'\\' : \\'s\\' }} {{ q ? \\' for \\' : \\'\\' }}\\t\\t\\t\\t<span ng-if=\\"q\\" class=\\"ss-results-query\\">\\"{{ q }}\\"</span>\\t\\t\\t</h3>\\t\\t\\t<h3 ng-if=\\"pagination.totalResults === 0\\" class=\\"ss-title ss-results-title ss-no-results-title\\">\\t\\t\\t\\tNo results {{ q ? \\'for\\' : \\'\\' }}\\t\\t\\t\\t<span ng-if=\\"q\\" class=\\"ss-results-query\\">\\"{{ q }}\\"</span>\\t\\t\\t\\tfound.\\t\\t\\t</h3>\\t\\t\\t<p ng-if=\\"query.corrected\\" class=\\"ss-oq\\">No results found for \\"{{ query.original }}\\", showing results for \\"{{ q }}\\"</p>\\t\\t\\t<div ng-if=\\"merchandising.content.header.length > 0\\" id=\\"ss-merch-header\\" class=\\"ss-merchandising\\" ss-merchandising=\\"header\\"></div>\\t\\t</header>\\t\\t<div ng-if=\\"pagination.totalResults\\" class=\\"ss-results\\"></div>\\t\\t<div ng-if=\\"pagination.totalResults === 0\\" class=\\"ss-no-results\\"></div>\\t</section></script><!-- Results --><script type=\\"text/template\\" name=\\"Results\\" target=\\".ss-results\\">\\t<div ng-if=\\"filterSummary.length && (slideout.triggered || facets.horizontal)\\" class=\\"ss-summary ss-summary-horizontal\\"></div>\\t<div ng-if=\\"slideout.triggered\\" class=\\"ss-slideout-toolbar\\"></div>\\t<div ng-if=\\"!slideout.triggered && facets.horizontal\\" class=\\"ss-facets-horizontal\\"></div>\\t<div class=\\"ss-toolbar ss-toolbar-top\\"></div>\\t<div ng-if=\\"merchandising.content.banner.length > 0\\" id=\\"ss-merch-banner\\" class=\\"ss-merchandising\\" ss-merchandising=\\"banner\\"></div>\\t<div class=\\"ss-item-container ss-flex-wrap\\"></div>\\t<div ng-if=\\"merchandising.content.footer.length > 0\\" id=\\"ss-merch-footer\\" class=\\"ss-merchandising\\" ss-merchandising=\\"footer\\"></div>\\t<div ng-if=\\"pagination.totalPages > 1\\" class=\\"ss-toolbar ss-toolbar-bottom\\"><div class=\\"ss-pagination\\"></div></div></script><!-- Results - Loading --><script type=\\"text/template\\" name=\\"Results - Loading\\" target=\\"#searchspring-loading\\">\\t<div class=\\"ss-results-loading\\" ng-class=\\"{\\'ss-active\\': loading}\\"><div class=\\"ss-results-loading-bar\\"></div></div></script><!-- Results - Items --><script type=\\"text/template\\" name=\\"Results - Items\\" target=\\".ss-results .ss-item-container\\">\\t<article ng-repeat=\\"result in results track by result.uid\\" class=\\"ss-item\\">\\t\\t<div ng-if=\\"result.isInlineBanner\\" class=\\"ss-inline-banner\\" ng-bind-html=\\"result.content | trusted\\"></div>\\t\\t<div ng-if=\\"!result.isInlineBanner\\" class=\\"ss-item-inner\\">\\t\\t\\t<figure class=\\"ss-item-image\\">\\t\\t\\t\\t<div class=\\"ss-badge-container\\"><div class=\\"ss-badge\\">Sale</div></div>\\t\\t\\t\\t<a\\t\\t\\t\\t\\tclass=\\"ss-image-link\\"\\t\\t\\t\\t\\tng-href=\\"{{ result.url }}\\"\\t\\t\\t\\t\\tintellisuggest\\t\\t\\t\\t\\tng-if=\\"typeOf(result.children)==\\'array\\' && result.children.length>0 && result.children[0].search_match!=false && result.children[0].facet_match!=false\\"\\t\\t\\t\\t>\\t\\t\\t\\t\\t<div class=\\"ss-image-wrapper ss-image-base\\" ng-style=\\"{\\'background-image\\': \\'url(\\' + result.children[0].image_link_child + \\')\\'}\\">\\t\\t\\t\\t\\t\\t<img\\t\\t\\t\\t\\t\\t\\tng-src=\\"{{ result.children[0].image_link_child }}\\"\\t\\t\\t\\t\\t\\t\\talt=\\"{{ result.children[0].title_child }}\\"\\t\\t\\t\\t\\t\\t\\ttitle=\\"{{ result.children[0].title_child }}\\"\\t\\t\\t\\t\\t\\t/>\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t</a>\\t\\t\\t\\t<a\\t\\t\\t\\t\\tclass=\\"ss-image-link\\"\\t\\t\\t\\t\\tng-href=\\"{{ result.url }}\\"\\t\\t\\t\\t\\tintellisuggest\\t\\t\\t\\t\\tng-if=\\"!result.children || result.children.length==0 || result.children[0].search_match==false || result.children[0].facet_match==false\\"\\t\\t\\t\\t>\\t\\t\\t\\t\\t<div class=\\"ss-image-wrapper ss-image-base\\" ng-style=\\"{\\'background-image\\': \\'url(\\' + result.imageUrl + \\')\\'}\\">\\t\\t\\t\\t\\t\\t<img ng-src=\\"{{ result.imageUrl }}\\" alt=\\"{{ result.name }}\\" title=\\"{{ result.name }}\\" />\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t</a>\\t\\t\\t</figure>\\t\\t\\t<div class=\\"ss-item-mid-border\\"></div>\\t\\t\\t<div class=\\"ss-item-details\\">\\t\\t\\t\\t<div class=\\"ss-item-details-inner\\">\\t\\t\\t\\t\\t<p class=\\"ss-item-name\\"><a ng-href=\\"{{ result.url }}\\" intellisuggest>{{ result.name }}</a></p>\\t\\t\\t\\t\\t<p class=\\"ss-item-price\\">\\t\\t\\t\\t\\t\\t<span ng-if=\\"result.msrp && (result.msrp * 1) > (result.price * 1)\\" class=\\"ss-item-msrp\\">{{ result.msrp | currency }}</span>\\t\\t\\t\\t\\t\\t<span class=\\"ss-item-regular\\" ng-class=\\"{\\'ss-item-on-sale\\': result.msrp && (result.msrp * 1) > (result.price * 1)}\\">\\t\\t\\t\\t\\t\\t\\t{{ result.price | currency }}\\t\\t\\t\\t\\t\\t</span>\\t\\t\\t\\t\\t</p>\\t\\t\\t\\t</div>\\t\\t\\t</div>\\t\\t</div>\\t</article></script><!-- No Results --><script type=\\"text/template\\" name=\\"No Results\\" target=\\".ss-no-results\\">\\t<div class=\\"ss-no-results-container\\">\\t\\t<p ng-if=\\"didYouMean.query.length\\" class=\\"ss-did-you-mean\\">\\t\\t\\tDid you mean\\t\\t\\t<a href=\\"{{ location().remove(context.search).add(context.search, didYouMean.query).url() }}\\">{{ didYouMean.query }}</a>\\t\\t\\t?\\t\\t</p>\\t</div>\\t<div ng-if=\\"merchandising.content.banner.length > 0\\" id=\\"ss-merch-banner\\" class=\\"ss-merchandising\\" ss-merchandising=\\"banner\\"></div>\\t<div ng-if=\\"filterSummary.length && (slideout.triggered || facets.horizontal)\\" class=\\"ss-summary ss-summary-horizontal\\"></div>\\t<div class=\\"ss-no-results-container\\">\\t\\t<h4 class=\\"ss-title\\">Suggestions</h4>\\t\\t<ul class=\\"ss-suggestion-list\\">\\t\\t\\t<li>Check for misspellings.</li>\\t\\t\\t<li>Remove possible redundant keywords (ie. \\"products\\").</li>\\t\\t\\t<li>Use other words to describe what you are searching for.</li>\\t\\t</ul>\\t\\t<p>\\t\\t\\tStill can\\'t find what you\\'re looking for?\\t\\t\\t<a href=\\"/urlhere.html\\">Contact us</a>\\t\\t\\t.\\t\\t</p>\\t\\t<div class=\\"ss-contact ss-location\\">\\t\\t\\t<h4 class=\\"ss-title\\">Address</h4>\\t\\t\\t<p>\\t\\t\\t\\t1234 Random Street\\t\\t\\t\\t<br />\\t\\t\\t\\tSome City, XX, 12345\\t\\t\\t</p>\\t\\t</div>\\t\\t<div class=\\"ss-contact ss-hours\\">\\t\\t\\t<h4 class=\\"ss-title\\">Hours</h4>\\t\\t\\t<p>\\t\\t\\t\\tMon - Sat, 00:00am - 00:00pm\\t\\t\\t\\t<br />\\t\\t\\t\\tSun, 00:00am - 00:00pm\\t\\t\\t</p>\\t\\t</div>\\t\\t<div class=\\"ss-contact ss-phone\\">\\t\\t\\t<h4 class=\\"ss-title\\">Call Us</h4>\\t\\t\\t<p>\\t\\t\\t\\t<strong>Telephone:</strong>\\t\\t\\t\\t123-456-7890\\t\\t\\t\\t<br />\\t\\t\\t\\t<strong>Toll Free:</strong>\\t\\t\\t\\t123-456-7890\\t\\t\\t</p>\\t\\t</div>\\t\\t<div class=\\"ss-contact ss-email\\">\\t\\t\\t<h4 class=\\"ss-title\\">Email</h4>\\t\\t\\t<p><a href=\\"mailto:email@sitename.com\\">email@sitename.com</a></p>\\t\\t</div>\\t</div>\\t<div ng-if=\\"merchandising.content.footer.length > 0\\" id=\\"ss-merch-footer\\" class=\\"ss-merchandising\\" ss-merchandising=\\"footer\\"></div></script><!-- Slideout - Button --><script type=\\"text/template\\" name=\\"Slideout - Button\\" target=\\".ss-slideout-toolbar\\">\\t<button ng-if=\\"pagination.totalResults && facets.length > 0\\" class=\\"ss-slideout-button ss-button ss-pointer\\" type=\\"button\\" slideout>\\t\\tFilter Options\\t</button></script><!-- Slideout - Menu --><script type=\\"text/template\\" name=\\"Slideout - Menu\\" slideout=\\"\\">\\t<div ng-if=\\"facets.length > 0\\" class=\\"ss-slideout-header\\">\\t\\t<h4 class=\\"ss-title\\">Filter Options</h4>\\t\\t<a class=\\"ss-close ss-pointer\\" slideout></a>\\t</div>\\t<div\\t\\tng-if=\\"facets.length > 0 && slideout.triggered\\"\\t\\tclass=\\"ss-slideout-facets ss-sidebar-container ss-scrollbar\\"\\t\\tng-swipe-left=\\"slideout.toggleSlideout()\\"\\t>\\t\\t<div class=\\"ss-facets\\"></div>\\t</div></script><!-- Toolbar - Top --><script type=\\"text/template\\" name=\\"Toolbar - Top\\" target=\\".ss-toolbar-top\\">\\t<div class=\\"ss-toolbar-row ss-flex-wrap-center\\">\\t\\t<div class=\\"ss-toolbar-col ss-sort-by\\">\\t\\t\\t<div class=\\"ss-dropdown-menu ss-sort-by-menu\\">\\t\\t\\t\\t<div class=\\"ss-menu-label ss-pointer\\" ng-click=\\"utilities.dropdown.show($event)\\">\\t\\t\\t\\t\\t<strong>Sort By:</strong>\\t\\t\\t\\t\\t{{ sorting.current.label }}\\t\\t\\t\\t\\t<div class=\\"ss-menu-toggle-icon\\"></div>\\t\\t\\t\\t</div>\\t\\t\\t\\t<div class=\\"ss-menu-list\\">\\t\\t\\t\\t\\t<div ng-repeat=\\"option in sorting.options\\" class=\\"ss-menu-list-option\\" ng-class=\\"{\\'ss-active\\': sorting.current.label == option.label}\\">\\t\\t\\t\\t\\t\\t<a ng-href=\\"{{ option.url }}\\" class=\\"ss-menu-list-link\\">{{ option.label }}</a>\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t</div>\\t\\t\\t</div>\\t\\t</div>\\t\\t<div class=\\"ss-toolbar-col ss-per-page\\">\\t\\t\\t<div class=\\"ss-dropdown-menu ss-per-page-menu\\">\\t\\t\\t\\t<div class=\\"ss-menu-label ss-pointer\\" ng-click=\\"utilities.dropdown.show($event)\\">\\t\\t\\t\\t\\t<strong>Per Page:</strong>\\t\\t\\t\\t\\t{{ pagination.perPage }}\\t\\t\\t\\t\\t<div class=\\"ss-menu-toggle-icon\\"></div>\\t\\t\\t\\t</div>\\t\\t\\t\\t<div class=\\"ss-menu-list ss-menu-list\\">\\t\\t\\t\\t\\t<div\\t\\t\\t\\t\\t\\tng-repeat=\\"n in [pagination.defaultPerPage, (pagination.defaultPerPage * 2), (pagination.defaultPerPage * 3)]\\"\\t\\t\\t\\t\\t\\tclass=\\"ss-menu-list-option\\"\\t\\t\\t\\t\\t\\tng-class=\\"{\\'ss-active\\': n == pagination.perPage}\\"\\t\\t\\t\\t\\t>\\t\\t\\t\\t\\t\\t<a ng-click=\\"pagination.perPage = n\\" class=\\"ss-menu-list-link ss-pointer\\">{{ n }}</a>\\t\\t\\t\\t\\t</div>\\t\\t\\t\\t</div>\\t\\t\\t</div>\\t\\t</div>\\t\\t<div ng-if=\\"!slideout.triggered && pagination.totalPages > 1\\" class=\\"ss-toolbar-col ss-pagination\\"></div>\\t</div></script>')