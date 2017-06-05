import BaseResource from '../../src/resources/base';

describe('BaseResource', () => {
  test('can be empty', () => {
    const res = new BaseResource();
    expect(res.$name).toBeUndefined();
    expect(res.$aliases).toBeUndefined();
    expect(res.$hasAlias('hi')).toBe(false);
  });

  test('can inherit from parents', () => {
    const parent1 = new BaseResource({$name: 'parent1'});
    const parent2 = new BaseResource({$name: 'parent2'});
    const res = new BaseResource();
    res.$inherit(parent1);
    res.$inherit(parent2);
    const parents = [];
    res.$forEachParent(parent => parents.push(parent));
    expect(parents).toEqual([parent1, parent2]);
  });

  test('can create instances', () => {
    const parent1 = new BaseResource({$name: 'parent1'});
    const parent2 = new BaseResource({$name: 'parent2'});
    const res = parent1.$instantiate();
    expect(res.$isInstanceOf(parent1)).toBe(true);
    expect(res.$isInstanceOf(parent2)).toBe(false);
    const child = res.$instantiate();
    expect(child.$isInstanceOf(res)).toBe(true);
    expect(child.$isInstanceOf(parent1)).toBe(true);
    expect(child.$isInstanceOf(parent2)).toBe(false);
  });

  test('can have a name', () => {
    const res = new BaseResource();
    expect(res.$name).toBeUndefined();
    expect(res.$getScope()).toBeUndefined();
    expect(res.$getIdentifier()).toBeUndefined();
    res.$name = 'hello';
    expect(res.$name).toBe('hello');
    expect(res.$getScope()).toBeUndefined();
    expect(res.$getIdentifier()).toBe('hello');
    res.$name = 'runtools/hello';
    expect(res.$name).toBe('runtools/hello');
    expect(res.$getScope()).toBe('runtools');
    expect(res.$getIdentifier()).toBe('hello');
  });

  test('validates name', () => {
    expect(() => new BaseResource({$name: 'hello'})).not.toThrow();
    expect(() => new BaseResource({$name: 'runtools/hello'})).not.toThrow();
    expect(() => new BaseResource({$name: ''})).toThrow();
    expect(() => new BaseResource({$name: 'hello*'})).toThrow();
    expect(() => new BaseResource({$name: 'runtools/'})).toThrow();
    expect(() => new BaseResource({$name: '/hello'})).toThrow();
  });

  test('can have aliases', () => {
    const res = new BaseResource({$aliases: ['hi']});
    expect(res.$hasAlias('hi')).toBe(true);
    expect(res.$hasAlias('bonjour')).toBe(false);
    res.$addAlias('bonjour');
    expect(res.$hasAlias('bonjour')).toBe(true);
  });

  test('is matchable by name or aliases', () => {
    const res = new BaseResource({$name: 'hello', $aliases: ['hi', 'bonjour']});
    expect(res.$isMatching('hello')).toBe(true);
    expect(res.$isMatching('hi')).toBe(true);
    expect(res.$isMatching('bonjour')).toBe(true);
    expect(res.$isMatching('bye')).toBe(false);
  });

  test('can have a version number', () => {
    expect(new BaseResource().$version).toBeUndefined();
    expect(new BaseResource({$version: '1.2.3'}).$version.toString()).toBe('1.2.3');
    expect(() => new BaseResource({$version: '1.2.3.4'})).toThrow();
  });

  test('can have a description', () => {
    expect(new BaseResource().$description).toBeUndefined();
    expect(new BaseResource({$description: 'This is a resource'}).$description).toBe(
      'This is a resource'
    );
  });

  test('can have authors', () => {
    expect(new BaseResource().$authors).toBeUndefined();
    expect(new BaseResource({$authors: 'Manu'}).$authors).toEqual(['Manu']);
    expect(new BaseResource({$authors: ['Manu', 'Paul']}).$authors).toEqual(['Manu', 'Paul']);
  });

  test('can have a repository', () => {
    expect(new BaseResource().$repository).toBeUndefined();
    expect(new BaseResource({$repository: 'git://github.com/user/repo'}).$repository).toBe(
      'git://github.com/user/repo'
    );
  });

  test('can have a license', () => {
    expect(new BaseResource().$license).toBeUndefined();
    expect(new BaseResource({$license: 'MIT'}).$license).toBe('MIT');
  });

  test('supports both singular and plural names for some properties', () => {
    const res1 = new BaseResource({$author: 'Manu'});
    expect(res1.$authors).toEqual(['Manu']);

    const res2 = new BaseResource({$authors: ['Manu', 'Vince']});
    expect(res2.$authors).toEqual(['Manu', 'Vince']);

    let error;
    try {
      const res3 = new BaseResource({$name: 'hello', $authors: 'Manu', $author: 'Manu'}); // eslint-disable-line no-unused-vars
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Error);
    expect(error.contextStack).toHaveLength(1);
    expect(error.contextStack[0]).toBeInstanceOf(BaseResource);
    expect(error.contextStack[0].$name).toBe('hello');
  });

  test('is serializable', () => {
    const res1 = new BaseResource({});
    expect(res1.$serialize()).toBeUndefined();
    const definition = {
      $name: 'hello',
      $aliases: ['hi', 'bonjour'],
      $version: '1.2.3',
      $description: 'This is a resource',
      $authors: ['Manu', 'Vince'],
      $repository: 'git://github.com/user/repo',
      $license: 'MIT'
    };
    const res2 = new BaseResource(definition);
    expect(res2.$serialize()).toEqual(definition);
    const res3 = new BaseResource({$author: 'Manu'});
    expect(res3.$serialize()).toEqual({$author: 'Manu'});
  });
});
