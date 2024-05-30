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
SearchSpring.Catalog.templates.promises.receive.resolve('<!-- Stylesheet --><link rel="stylesheet" type="text/css" href="//cdn.searchspring.net/ajax_search/sites/scmq7n/css/scmq7n.css" /><!-- AutoComplete --><script type="text/template" name="AutoComplete" target="[ss-autocomplete]">	<div class="ss-ac-container ss-flex-wrap" ng-show="ac.visible" ng-class="{'no-terms': !ac.terms.length, 'no-results': !ac.results.length}">		<div class="ss-ac-terms" ng-show="ac.terms">			<h5 ng-if="ac.trendingVerbiageVisible" class="ss-ac-terms-heading">{{ ac.trendingVerbiage }}</h5>			<div class="ss-list">				<div ng-repeat="term in ac.terms | limitTo:4" class="ss-list-option" ng-class="{'ss-active': term.active}">					<a ng-bind-html="term.label | trusted" ss-no-ps ss-nav-selectable ng-focus="term.preview()" href="{{ term.url }}" class="ss-list-link"></a>				</div>			</div>		</div>		<div ng-if="ac.results.length" class="ss-ac-content ss-flex-wrap">			<div class="ss-ac-facets" ng-show="ac.facets">				<div class="ss-ac-facets-row">					<div						ng-repeat="facet in ac.facets | filter: { type: '!slider' } | limitTo: 3"						ng-switch="facet.type"						ng-if="facet.values.length"						id="ss-ac-{{ facet.field }}"						class="ss-ac-facet-container ss-ac-facet-container-{{ (facet.type && (facet.type != 'hierarchy' || facet.type != 'slider')) ? facet.type : 'list' }}"					>						<h4 class="ss-title">{{ facet.label }}</h4>						<div ng-switch-when="grid" class="ss-grid ss-flex-wrap">							<div ng-repeat="value in facet.values | limitTo:6" class="ss-grid-option" ng-class="{'ss-active': value.active}">								<a href="{{ value.url }}" ss-no-ps ss-nav-selectable ng-focus="value.preview()" class="ss-grid-link">									<div class="ss-grid-block"></div>									<div class="ss-grid-label">{{ value.label }}</div>								</a>							</div>						</div>						<div ng-switch-when="palette" class="ss-palette ss-flex-wrap">							<div ng-repeat="value in facet.values | limitTo:6" class="ss-palette-option" ng-class="{'ss-active': value.active}">								<a href="{{ value.url }}" ss-no-ps ss-nav-selectable ng-focus="value.preview()" class="ss-palette-link" alt="{{ value.label }}">									<div class="ss-palette-block">										<div											class="ss-palette-color ss-palette-color-{{ value.value | handleize }}"											ng-style="{'background-color': (value.value | handleize)}"										></div>									</div>									<div class="ss-palette-label">{{ value.label }}</div>								</a>							</div>						</div>						<div ng-switch-default class="ss-list">							<div ng-repeat="value in facet.values | limitTo:5" class="ss-list-option" ng-class="{'ss-active': value.active}">								<a href="{{ value.url }}" ss-no-ps ss-nav-selectable ng-focus="value.preview()" class="ss-list-link">{{ value.label }}</a>							</div>						</div>					</div>				</div>				<div ng-if="ac.merchandising.content.left.length > 0" id="ss-ac-merch-left" class="ss-ac-merchandising" ss-merchandising="ac.left"></div>			</div>			<div class="ss-ac-results">				<h4 class="ss-title">Product Suggestions</h4>				<div ng-if="ac.merchandising.content.header.length > 0" id="ss-ac-merch-header" class="ss-ac-merchandising" ss-merchandising="ac.header"></div>				<div ng-if="ac.merchandising.content.banner.length > 0" id="ss-ac-merch-banner" class="ss-ac-merchandising" ss-merchandising="ac.banner"></div>				<div ng-if="ac.results.length" class="ss-ac-item-container ss-flex-wrap">					<article class="ss-ac-item" ng-repeat="result in ac.results | limitTo:ac.pagination.perPage">						<div ng-if="result.isInlineBanner" class="ss-inline-banner" ng-bind-html="result.content | trusted"></div>						<a ng-if="!result.isInlineBanner" ng-href="{{ result.url }}" ss-no-ps ss-nav-selectable>							<div class="ss-ac-item-image">								<div									class="ss-image-wrapper"									ng-style="{'background-image': 'url(' + (result.thumbnailImageUrl ? result.thumbnailImageUrl : '//cdn.searchspring.net/ajax_search/img/default_image.png') + ')'}"									alt="{{ result.name }}"									title="{{ result.name }}"								></div>							</div>							<div class="ss-ac-item-details">								<p class="ss-ac-item-name">{{ result.name | truncate:40:'&hellip;' }}</p>								<p class="ss-ac-item-price">									<span ng-if="result.msrp && (result.msrp * 1) > (result.price * 1)" class="ss-ac-item-msrp">{{ result.msrp | currency }}</span>									<span class="ss-ac-item-regular" ng-class="{'ss-ac-item-on-sale': result.msrp && (result.msrp * 1) > (result.price * 1)}">										{{ result.price | currency }}									</span>								</p>							</div>						</a>					</article>				</div>				<div ng-if="ac.merchandising.content.footer.length > 0" id="ss-ac-merch-footer" class="ss-ac-merchandising" ss-merchandising="ac.footer"></div>				<div ng-if="!ac.results.length" class="ss-ac-no-results"><p>No results found for "{{ ac.q }}". Please try another search.</p></div>			</div>			<div class="ss-ac-see-more">				<a href="{{ ac.location.remove('perpage').url() }}" ng-click="ac.visible = false;" class="ss-ac-see-more-link ss-title" ss-nav-selectable>					See {{ ac.pagination.totalResults }} {{ ac.breadcrumbs.length > 1 ? 'filtered' : '' }} result{{ ac.pagination.totalResults > 1 ? 's' : '' }} for					"{{ ac.q }}"				</a>			</div>		</div>	</div></script><!-- Facets - Range Slider --><script type="text/template" name="Facets - Range Slider" target=".ss-range-slider-container">	<div ng-if="facet.range[0] != facet.range[1]" ss-facet-slider="facet" class="ss-range-slider"></div>	<div ng-if="facet.range[0] != facet.range[1] && facet.facet_active" class="ss-range-slider-reset">		<a ng-if="facet.facet_active" ng-href="{{ location().remove('filter', facet.field).url() }}" class="ss-range-slider-reset-link">Reset</a>	</div></script><!-- SearchSpring Sidebar --><script type="text/template" name="SearchSpring Sidebar" module="search" target="#searchspring-sidebar">	<aside ng-if="!slideout.triggered" class="ss-sidebar-container">		<div ng-if="filterSummary.length" class="ss-summary"></div>		<div ng-if="facets.length === 0" class="ss-filter-messages"></div>		<div ng-if="facets.length" class="ss-facets"></div>	</aside></script><!-- Filter Messages --><script type="text/template" name="Filter Messages" target=".ss-filter-messages">	<p ng-if="pagination.totalResults === 0 && filterSummary.length === 0" class="ss-filter-message-content">		There are no results to refine. If you need additional help, please try our search "		<strong>Suggestions</strong>		".	</p>	<p ng-if="pagination.totalResults === 0 && filterSummary.length" class="ss-filter-message-content">		If you are not seeing any results, try removing some of your selected filters.	</p>	<p ng-if="pagination.totalResults && filterSummary.length === 0" class="ss-filter-message-content">There are no filters to refine by.</p></script><!-- Facets --><script type="text/template" name="Facets" target=".ss-facets">	<article		ng-repeat="facet in facets"		ng-switch="facet.type"		id="ss-{{ facet.field }}"		class="ss-facet-container ss-facet-container-{{ facet.type ? facet.type : 'list' }}"		ng-class="{'ss-expanded': !facet.collapse, 'ss-collapsed': facet.collapse}"	>		<h4 ng-click="facet.collapse = !facet.collapse" class="ss-title ss-pointer">{{ facet.label }}</h4>		<div class="ss-facet-options">			<div ng-switch-when="hierarchy" class="ss-hierarchy">				<div					ng-repeat="value in facet.values | limitTo:facet.overflow.limit"					class="ss-hierarchy-option"					ng-class="{'ss-hierarchy-current': value.active, 'ss-hierarchy-return': value.history && !value.active}"				>					<a ng-if="!value.active" ng-href="{{ value.url }}" class="ss-hierarchy-link">						{{ value.label }}						<span ng-if="!value.history" class="ss-facet-count">({{ value.count }})</span>					</a>					{{ value.active ? value.label : '' }}				</div>			</div>			<div ng-switch-when="grid" class="ss-grid ss-flex-wrap">				<div ng-repeat="value in facet.values | limitTo:facet.overflow.limit" class="ss-grid-option" ng-class="{'ss-active': value.active}">					<a href="{{ value.url }}" class="ss-grid-link">						<div class="ss-grid-block"></div>						<div class="ss-grid-label">{{ value.label }}</div>					</a>				</div>			</div>			<div ng-switch-when="palette" class="ss-palette ss-flex-wrap">				<div ng-repeat="value in facet.values | limitTo:facet.overflow.limit" class="ss-palette-option" ng-class="{'ss-active': value.active}">					<a href="{{ value.url }}" class="ss-palette-link" alt="{{ value.label }}">						<div class="ss-palette-block">							<div class="ss-palette-color ss-palette-color-{{ value.value | handleize }}" ng-style="{'background-color': (value.value | handleize)}"></div>						</div>						<div class="ss-palette-label">{{ value.label }}</div>					</a>				</div>			</div>			<div ng-switch-when="slider" class="ss-range-slider-container"></div>			<div ng-switch-default class="ss-list" ng-class="{'ss-scrollbar': facet.overflow.remaining != facet.overflow.count}">				<div ng-repeat="value in facet.values | limitTo:facet.overflow.limit" class="ss-list-option" ng-class="{'ss-active': value.active}">					<a href="{{ value.url }}" class="ss-list-link ss-checkbox" ng-class="{'ss-checkbox-round': facet.multiple == 'single'}">						{{ value.label }}						<span class="ss-facet-count">({{ value.count }})</span>					</a>				</div>			</div>			<div				ng-if="facet.overflow.set(facet.limitCount).count"				class="ss-show-more"				ng-class="{'ss-expanded': facet.overflow.remaining, 'ss-collapsed': !facet.overflow.remaining}"			>				<a ng-click="facet.overflow.toggle()" class="ss-show-more-link ss-pointer">Show {{ facet.overflow.remaining ? 'More' : 'Less' }}</a>			</div>		</div>	</article>	<div ng-if="merchandising.content.left.length > 0" id="ss-merch-left" class="ss-merchandising" ss-merchandising="left"></div></script><!-- Filter Summary --><script type="text/template" name="Filter Summary" target=".ss-summary">	<div class="ss-summary-container">		<h4 ng-if="!slideout.triggered && !facets.horizontal" class="ss-title">Current Filters</h4>		<div class="ss-list ss-flex-wrap-center">			<div ng-if="slideout.triggered || facets.horizontal" class="ss-list-option ss-list-title">				<span class="ss-summary-label">Current Filters:</span>			</div>			<div ng-repeat="filter in filterSummary" class="ss-list-option">				<a href="{{ filter.remove.url }}" class="ss-list-link">					<span class="ss-summary-label">{{ filter.filterLabel }}:</span>					<span class="ss-summary-value">{{ filter.filterValue }}</span>				</a>			</div>			<div class="ss-list-option ss-summary-reset">				<a href="{{ location().remove('filter').remove('rq').url() }}" class="ss-list-link">Clear All</a>			</div>		</div>	</div></script><!-- Pagination --><script type="text/template" name="Pagination" target=".ss-pagination">	<div class="ss-pagination-row">		<div ng-if="pagination.previous" class="ss-page ss-page-previous"><a ng-href="{{ pagination.previous.url }}" class="ss-page-link">Previous</a></div>		<div ng-if="pagination.totalPages > 5 && pagination.currentPage > 3" class="ss-page ss-page-first">			<a ng-href="{{ pagination.first.url }}" class="ss-page-link">{{ pagination.first.number }}</a>		</div>		<div ng-if="pagination.totalPages > 5 && pagination.currentPage > 3" class="ss-page ss-page-hellip">			<span class="ss-page-label">&hellip;</span>		</div>		<div ng-repeat="page in pagination.getPages(5)" class="ss-page" ng-class="{'ss-active': page.active}">			<a ng-if="!page.active" ng-href="{{ page.url }}" class="ss-page-link">{{ page.number }}</a>			<span ng-if="page.active" class="ss-page-label">{{ page.number }}</span>		</div>		<div ng-if="pagination.totalPages > 5 && pagination.currentPage < (pagination.totalPages - 2)" class="ss-page ss-page-hellip">			<span class="ss-page-label">&hellip;</span>		</div>		<div ng-if="pagination.totalPages > 5 && pagination.currentPage < (pagination.totalPages - 2)" class="ss-page ss-page-last">			<a ng-href="{{ pagination.last.url }}" class="ss-page-link">{{ pagination.last.number }}</a>		</div>		<div ng-if="pagination.next" class="ss-page ss-page-next"><a ng-href="{{ pagination.next.url }}" class="ss-page-link">Next</a></div>	</div></script><!-- Results & No Results --><script type="text/template" name="Results &amp; No Results" module="search" target="#searchspring-content">	<section class="ss-content-container">		<header class="ss-header-container">			<h3 ng-if="pagination.totalResults" class="ss-title ss-results-title">				Showing				<span ng-if="pagination.multiplePages" class="ss-results-count-range">{{ pagination.begin }} - {{ pagination.end }}</span>				{{ pagination.multiplePages ? 'of' : '' }}				<span class="ss-results-count-total">{{ pagination.totalResults }}</span>				result{{ pagination.totalResults == 1 ? '' : 's' }} {{ q ? ' for ' : '' }}				<span ng-if="q" class="ss-results-query">"{{ q }}"</span>			</h3>			<h3 ng-if="pagination.totalResults === 0" class="ss-title ss-results-title ss-no-results-title">				No results {{ q ? 'for' : '' }}				<span ng-if="q" class="ss-results-query">"{{ q }}"</span>				found.			</h3>			<p ng-if="query.corrected" class="ss-oq">No results found for "{{ query.original }}", showing results for "{{ q }}"</p>			<div ng-if="merchandising.content.header.length > 0" id="ss-merch-header" class="ss-merchandising" ss-merchandising="header"></div>		</header>		<div ng-if="pagination.totalResults" class="ss-results"></div>		<div ng-if="pagination.totalResults === 0" class="ss-no-results"></div>	</section></script><!-- Results --><script type="text/template" name="Results" target=".ss-results">	<div ng-if="filterSummary.length && (slideout.triggered || facets.horizontal)" class="ss-summary ss-summary-horizontal"></div>	<div ng-if="slideout.triggered" class="ss-slideout-toolbar"></div>	<div ng-if="!slideout.triggered && facets.horizontal" class="ss-facets-horizontal"></div>	<div class="ss-toolbar ss-toolbar-top"></div>	<div ng-if="merchandising.content.banner.length > 0" id="ss-merch-banner" class="ss-merchandising" ss-merchandising="banner"></div>	<div class="ss-item-container ss-flex-wrap"></div>	<div ng-if="merchandising.content.footer.length > 0" id="ss-merch-footer" class="ss-merchandising" ss-merchandising="footer"></div>	<div ng-if="pagination.totalPages > 1" class="ss-toolbar ss-toolbar-bottom"><div class="ss-pagination"></div></div></script><!-- Results - Loading --><script type="text/template" name="Results - Loading" target="#searchspring-loading">	<div class="ss-results-loading" ng-class="{'ss-active': loading}"><div class="ss-results-loading-bar"></div></div></script><!-- Results - Items --><script type="text/template" name="Results - Items" target=".ss-results .ss-item-container">	<article ng-repeat="result in results track by result.uid" class="ss-item">		<div ng-if="result.isInlineBanner" class="ss-inline-banner" ng-bind-html="result.content | trusted"></div>		<div ng-if="!result.isInlineBanner" class="ss-item-inner">			<figure class="ss-item-image">				<div class="ss-badge-container"><div class="ss-badge">Sale</div></div>				<a					class="ss-image-link"					ng-href="{{ result.url }}"					intellisuggest					ng-if="typeOf(result.children)=='array' && result.children.length>0 && result.children[0].search_match!=false && result.children[0].facet_match!=false"				>					<div class="ss-image-wrapper ss-image-base" ng-style="{'background-image': 'url(' + result.children[0].image_link_child + ')'}">						<img							ng-src="{{ result.children[0].image_link_child }}"							alt="{{ result.children[0].title_child }}"							title="{{ result.children[0].title_child }}"						/>					</div>				</a>				<a					class="ss-image-link"					ng-href="{{ result.url }}"					intellisuggest					ng-if="!result.children || result.children.length==0 || result.children[0].search_match==false || result.children[0].facet_match==false"				>					<div class="ss-image-wrapper ss-image-base" ng-style="{'background-image': 'url(' + result.imageUrl + ')'}">						<img ng-src="{{ result.imageUrl }}" alt="{{ result.name }}" title="{{ result.name }}" />					</div>				</a>			</figure>			<div class="ss-item-mid-border"></div>			<div class="ss-item-details">				<div class="ss-item-details-inner">					<p class="ss-item-name"><a ng-href="{{ result.url }}" intellisuggest>{{ result.name }}</a></p>					<p class="ss-item-price">						<span ng-if="result.msrp && (result.msrp * 1) > (result.price * 1)" class="ss-item-msrp">{{ result.msrp | currency }}</span>						<span class="ss-item-regular" ng-class="{'ss-item-on-sale': result.msrp && (result.msrp * 1) > (result.price * 1)}">							{{ result.price | currency }}						</span>					</p>				</div>			</div>		</div>	</article></script><!-- No Results --><script type="text/template" name="No Results" target=".ss-no-results">	<div class="ss-no-results-container">		<p ng-if="didYouMean.query.length" class="ss-did-you-mean">			Did you mean			<a href="{{ location().remove(context.search).add(context.search, didYouMean.query).url() }}">{{ didYouMean.query }}</a>			?		</p>	</div>	<div ng-if="merchandising.content.banner.length > 0" id="ss-merch-banner" class="ss-merchandising" ss-merchandising="banner"></div>	<div ng-if="filterSummary.length && (slideout.triggered || facets.horizontal)" class="ss-summary ss-summary-horizontal"></div>	<div class="ss-no-results-container">		<h4 class="ss-title">Suggestions</h4>		<ul class="ss-suggestion-list">			<li>Check for misspellings.</li>			<li>Remove possible redundant keywords (ie. "products").</li>			<li>Use other words to describe what you are searching for.</li>		</ul>		<p>			Still can't find what you're looking for?			<a href="/urlhere.html">Contact us</a>			.		</p>		<div class="ss-contact ss-location">			<h4 class="ss-title">Address</h4>			<p>				1234 Random Street				<br />				Some City, XX, 12345			</p>		</div>		<div class="ss-contact ss-hours">			<h4 class="ss-title">Hours</h4>			<p>				Mon - Sat, 00:00am - 00:00pm				<br />				Sun, 00:00am - 00:00pm			</p>		</div>		<div class="ss-contact ss-phone">			<h4 class="ss-title">Call Us</h4>			<p>				<strong>Telephone:</strong>				123-456-7890				<br />				<strong>Toll Free:</strong>				123-456-7890			</p>		</div>		<div class="ss-contact ss-email">			<h4 class="ss-title">Email</h4>			<p><a href="mailto:email@sitename.com">email@sitename.com</a></p>		</div>	</div>	<div ng-if="merchandising.content.footer.length > 0" id="ss-merch-footer" class="ss-merchandising" ss-merchandising="footer"></div></script><!-- Slideout - Button --><script type="text/template" name="Slideout - Button" target=".ss-slideout-toolbar">	<button ng-if="pagination.totalResults && facets.length > 0" class="ss-slideout-button ss-button ss-pointer" type="button" slideout>		Filter Options	</button></script><!-- Slideout - Menu --><script type="text/template" name="Slideout - Menu" slideout="">	<div ng-if="facets.length > 0" class="ss-slideout-header">		<h4 class="ss-title">Filter Options</h4>		<a class="ss-close ss-pointer" slideout></a>	</div>	<div		ng-if="facets.length > 0 && slideout.triggered"		class="ss-slideout-facets ss-sidebar-container ss-scrollbar"		ng-swipe-left="slideout.toggleSlideout()"	>		<div class="ss-facets"></div>	</div></script><!-- Toolbar - Top --><script type="text/template" name="Toolbar - Top" target=".ss-toolbar-top">	<div class="ss-toolbar-row ss-flex-wrap-center">		<div class="ss-toolbar-col ss-sort-by">			<div class="ss-dropdown-menu ss-sort-by-menu">				<div class="ss-menu-label ss-pointer" ng-click="utilities.dropdown.show($event)">					<strong>Sort By:</strong>					{{ sorting.current.label }}					<div class="ss-menu-toggle-icon"></div>				</div>				<div class="ss-menu-list">					<div ng-repeat="option in sorting.options" class="ss-menu-list-option" ng-class="{'ss-active': sorting.current.label == option.label}">						<a ng-href="{{ option.url }}" class="ss-menu-list-link">{{ option.label }}</a>					</div>				</div>			</div>		</div>		<div class="ss-toolbar-col ss-per-page">			<div class="ss-dropdown-menu ss-per-page-menu">				<div class="ss-menu-label ss-pointer" ng-click="utilities.dropdown.show($event)">					<strong>Per Page:</strong>					{{ pagination.perPage }}					<div class="ss-menu-toggle-icon"></div>				</div>				<div class="ss-menu-list ss-menu-list">					<div						ng-repeat="n in [pagination.defaultPerPage, (pagination.defaultPerPage * 2), (pagination.defaultPerPage * 3)]"						class="ss-menu-list-option"						ng-class="{'ss-active': n == pagination.perPage}"					>						<a ng-click="pagination.perPage = n" class="ss-menu-list-link ss-pointer">{{ n }}</a>					</div>				</div>			</div>		</div>		<div ng-if="!slideout.triggered && pagination.totalPages > 1" class="ss-toolbar-col ss-pagination"></div>	</div></script>')