describe('date field dropdowns directive', function () {

  var $rootScope, element, elementBlank, scope;
  beforeEach(module('rorymadden.date-dropdowns'));
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $rootScope.date = new Date("September 30, 2010 15:30:00");
    element = $compile('<input rsmdatedropdowns ng-model="date">')($rootScope);
    elementBlank = $compile('<input rsmdatedropdowns ng-model="other">')($rootScope);
    $rootScope.$digest();
    scope = element.scope();
  }));


  it("should populate the three select fields", function(){
    expect(element.find('select').length).toBe(3);
    expect(element.find('select[name="dateFields.day"] option:selected').text()).toBe('30');
    expect(element.find('select[name="dateFields.month"] option:selected').val()).toBe('8');
    expect(element.find('select[name="dateFields.year"] option:selected').text()).toBe('2010');

    expect(elementBlank.find('select[name="dateFields.day"] option:selected').text()).toBe('');
    expect(elementBlank.find('select[name="dateFields.month"] option:selected').val()).toBe('?');
    expect(elementBlank.find('select[name="dateFields.year"] option:selected').text()).toBe('');
  });

  // it("should update bad dates", function(){
  //   element.find('select[name="dateFields.day"] option:selected').text('30');
  //   element.find('select[name="dateFields.month"]').val(1);
  //   element.find('select[name="dateFields.year"] option:selected').text('2000');

  //   $rootScope.digest();

  //   // scope.dateFields.day = 30;
  //   // scope.dateFields.month = 1;
  //   // scope.dateFields.year= 2000;

  //   expect(element.find('select[name="dateFields.day"] option:selected').text()).toBe('29');
  //   expect(element.find('select[name="dateFields.month"] option:selected').val()).toBe('1');
  //   expect(element.find('select[name="dateFields.year"] option:selected').text()).toBe('2000');

  // });
});