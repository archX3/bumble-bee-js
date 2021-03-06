/**
 * @Author Created by ARCH on 12/29/16.
 * @Copyright (C) 2016
 * Barge Studios Inc, The Bumble-Bee Authors
 * <bargestd@gmail.com>
 * <bumble.bee@bargestd.com>
 *
 * @licence Licensed under the Barge Studios Eula
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 * http://www.bargestudios.com/bumblebee/licence
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *        \__/
 *    \  (-_-)  /
 *    \-( ___)-/
 *     ( ____)
 *   <-(____)->
 *    \      /
 *
 * @fileOverview Utilities for manipulating Objects/Maps/Hashes.
 * Shout outs to Erik Arvidsson aka arvomatic
 *
 * @requires Bee.Utils
 * @requires Bee.Array
 *
 * @user MSG: Some lines in this file use constructs from es6 or later
 * to make it es5 compatible check for es6+ or #es6+ in comments
 */

(function ()
{
   //localising references speeds up identifier look up time
   let Bu  = Bee.Utils,
       Ba  = Bee.Array,
       Boa = Bee.ObservableArray;

   //cr8n the Bee.Object object
   /**
    * @static
    * @type {{}}
    */
   Bee.Object = Bee.Object || {};

   /**
    * The names of the fields that are defined on Object.prototype.
    * @type {Array<string>}
    * @private
    */
   Bee.Object.PROTOTYPE_FIELDS = [
      'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
      'toLocaleString', 'toString', 'valueOf'
   ];

   /**
    * Whether two values are not observably distinguishable. This
    * correctly detects that 0 is not the same as -0 and two NaNs are
    * practically equivalent.
    *
    * The implementation is as suggested by harmony:egal proposal.
    *
    * @param {*} v The first value to compare.
    * @param {*} v2 The second value to compare.
    * @return {boolean} Whether two values are not observably distinguishable.
    * @see http://wiki.ecmascript.org/doku.php?id=harmony:egal
    */
   Bee.Object.is = function (v, v2)
   {
      if (v === v2)
      {
         // 0 === -0, but they are not identical.
         // We need the cast because the compiler requires that v2 is a
         // number (although 1/v2 works with non-number). We cast to ? to
         // stop the compiler from type-checking this statement.
         return v !== 0 || 1 / v === 1 / /** @type {?} */ (v2);
      }

      // NaN is non-reflexive: NaN !== NaN, although they are identical.
      return v !== v && v2 !== v2;
   };

   /**
    * Calls a function for each element in an object/map/hash.
    *
    * @param {Object<K,V>} obj The object over which to iterate.
    * @param {function(this:T,V,?,Object<K,V>):?} f The function to call
    *     for every element. This function takes 3 arguments (the value, the
    *     key and the object) and the return value is ignored.
    * @param {T=} opt_obj This is used as the 'this' object within f.
    * @template T,K,V
    */
   Bee.Object.forEach = function (obj, f, opt_obj)
   {
      for (var key in obj)
      {
         f.call(/** @type {?} */ (opt_obj), obj[key], key, obj);
      }
   };

   /**
    * Calls a function for each element in an object/map/hash. If that call returns
    * true, adds the element to a new object.
    *
    * @param {Object<K,V>} obj The object over which to iterate.
    * @param {function(this:T,V,?,Object<K,V>):boolean} f The function to call
    *     for every element. This
    *     function takes 3 arguments (the value, the key and the object)
    *     and should return a boolean. If the return value is true the
    *     element is added to the result object. If it is false the
    *     element is not included.
    * @param {T=} opt_obj This is used as the 'this' object within f.
    * @return {!Object<K,V>} a new object in which only elements that passed the
    *     test are present.
    * @template T,K,V
    */
   Bee.Object.filter = function (obj, f, opt_obj)
   {
      var res = {};
      for (var key in obj)
      {
         if (f.call(/** @type {?} */ (opt_obj), obj[key], key, obj))
         {
            res[key] = obj[key];
         }
      }
      return res;
   };

   /**
    * For every element in an object/map/hash calls a function and inserts the
    * result into a new object.
    *
    * @param {Object<K,V>} obj The object over which to iterate.
    * @param {function(this:T,V,?,Object<K,V>):R} f The function to call
    *     for every element. This function
    *     takes 3 arguments (the value, the key and the object)
    *     and should return something. The result will be inserted
    *     into a new object.
    * @param {T=} opt_obj This is used as the 'this' object within f.
    * @return {!Object<K,R>} a new object with the results from f.
    * @template T,K,V,R
    */
   Bee.Object.map = function (obj, f, opt_obj)
   {
      var res = {};
      for (var key in obj)
      {
         res[key] = f.call(/** @type {?} */ (opt_obj), obj[key], key, obj);
      }
      return res;
   };

   /**
    * Calls a function for each element in an object/map/hash. If any
    * call returns true, returns true (without checking the rest). If
    * all calls return false, returns false.
    *
    * @param {Object<K,V>} obj The object to check.
    * @param {function(this:T,V,?,Object<K,V>):boolean} f The function to
    *     call for every element. This function
    *     takes 3 arguments (the value, the key and the object) and should
    *     return a boolean.
    * @param {T=} opt_obj This is used as the 'this' object within f.
    * @return {boolean} true if any element passes the test.
    * @template T,K,V
    */
   Bee.Object.some = function (obj, f, opt_obj)
   {
      for (var key in obj)
      {
         if (f.call(/** @type {?} */ (opt_obj), obj[key], key, obj))
         {
            return true;
         }
      }
      return false;
   };

   /**
    * Calls a function for each element in an object/map/hash. If
    * all calls return true, returns true. If any call returns false, returns
    * false at this point and does not continue to check the remaining elements.
    *
    * @param {Object<K,V>} obj The object to check.
    * @param {?function(this:T,V,?,Object<K,V>):boolean} f The function to
    *     call for every element. This function
    *     takes 3 arguments (the value, the key and the object) and should
    *     return a boolean.
    * @param {T=} opt_obj This is used as the 'this' object within f.
    * @return {boolean} false if any element fails the test.
    * @template T,K,V
    */
   Bee.Object.every = function (obj, f, opt_obj)
   {
      for (var key in obj)
      {
         if (!f.call(/** @type {?} */ (opt_obj), obj[key], key, obj))
         {
            return false;
         }
      }
      return true;
   };

   /**
    * returns an the value for an item in an Object
    * if it exists and null if otherwise
    * @param {Object<K,V>} obj The object to check.
    * @param {String} key The function to
    *
    * @return {boolean} null if the key does not exist.
    */
   Bee.Object.get = function (obj, key)
   {
      if (key in obj)
      {
         return obj[key];
      }
      return null;
   };

   /**
    * Returns the number of key-value pairs in the object map.
    *
    * @param {Object} obj The object for which to get the number of key-value
    *     pairs.
    * @return {number} The number of key-value pairs in the object map.
    */
   Bee.Object.getCount = function (obj)
   {
      var rv = 0;
      for (var key in obj)
      {
         rv++;
      }
      return rv;
   };

   /**
    * Returns one key from the object map, if any exists.
    * For map literals the returned key will be the first one in most of the
    * browsers (a know exception is Konqueror).
    *
    * @param {Object} obj The object to pick a key from.
    * @return {string|undefined} The key or undefined if the object is empty.
    */
   Bee.Object.getAnyKey = function (obj)
   {
      let keys = [];
      for (let key in obj)
      {
         keys.push(key);
      }
      return keys[Math.random() * keys.length];
   };

   Bee.Object.getKeyAt = function (obj, index)
   {
      return Object.keys(obj)[index];
   };

   /**
    * Returns one value from the object map, if any exists.
    * For map literals the returned value will be the first one in most of the
    * browsers (a know exception is Konqueror).
    *
    * @param {Object<K,V>} obj The object to pick a value from.
    * @return {V|undefined} The value or undefined if the object is empty.
    * @template K,V
    */
   Bee.Object.getAnyValue = function (obj)
   {
      let vals = [];
      for (let key in obj)
      {
         vals.push(obj[key]);
      }
      return vals[Math.random() * vals.length];
   };

   /**
    * Whether the object/hash/map contains the given object as a value.
    * An alias for Bee.Object.containsValue(obj, val).
    *
    * @param {Object<K,V>} obj The object in which to look for val.
    * @param {V} val The object for which to check.
    * @return {boolean} true if val is present.
    * @template K,V
    */
   Bee.Object.contains = function (obj, val)
   {
      return Bee.Object.containsValue(obj, val);
   };

   /**
    * Returns the values of the object/map/hash.
    *
    * @param {Object<K,V>} obj The object from which to get the values.
    * @return {!Array<V>} The values in the object/map/hash.
    * @template K,V
    */
   Bee.Object.getValues = function (obj)
   {
      var res = [];
      var i = 0;
      for (var key in obj)
      {
         res[i++] = obj[key];
      }
      return res;
   };

   /**
    * Returns the keys of the object/map/hash.
    *
    * @param {Object} obj The object from which to get the keys.
    * @return {!Array<string>} Array of property keys.
    */
   Bee.Object.getKeys = function (obj)
   {
      var res = [];
      var i = 0;
      for (var key in obj)
      {
         res[i++] = key;
      }
      return res;
   };

   /**
    * Get a value from an object multiple levels deep.  This is useful for
    * pulling values from deeply nested objects, such as JSON responses.
    * Example usage: getValueByKeys(jsonObj, 'foo', 'entries', 3)
    *
    * @param {!Object} obj An object to get the value from.  Can be array-like.
    * @param {...(string|number|!IArrayLike<number|string>)}var_args
    *     A number of keys (as strings, or numbers, for array-like objects).  Can also be
    *     specified as a single array of keys.
    * @return {*} The resulting value.  If, at any point, the value for a key
    *     is undefined, returns undefined.
    */
   Bee.Object.getValueByKeys = function (obj, var_args)
   {
      var isArrayLike = Bee.isArrayLike(var_args);
      var keys = isArrayLike ? var_args : arguments;

      // Start with the 2nd parameter for the variable parameters syntax.
      for (var i = isArrayLike ? 0 : 1; i < keys.length; i++)
      {
         obj = obj[keys[i]];
         if (!Bee.isDef(obj))
         {
            break;
         }
      }

      return obj;
   };

   /**
    * Whether the object/map/hash contains the given key.
    *
    * @param {Object} obj The object in which to look for key.
    * @param {?} key The key for which to check.
    * @return {boolean} true If the map contains the key.
    */
   Bee.Object.containsKey = function (obj, key)
   {
      return obj !== null && key in obj;
   };

   /**
    * Whether the object/map/hash contains the given value. This is O(n).
    *
    * @param {Object<K,V>} obj The object in which to look for val.
    * @param {V} val The value for which to check.
    * @return {boolean} true If the map contains the value.
    * @template K,V
    */
   Bee.Object.containsValue = function (obj, val)
   {
      for (var key in obj)
      {
         if (obj[key] == val)
         {
            return true;
         }
      }
      return false;
   };

   /**
    * Searches an object for an element that satisfies the given condition and
    * returns its key.
    * @param {Object<K,V>} obj The object to search in.
    * @param {function(this:T,V,string,Object<K,V>):boolean} f The
    *      function to call for every element. Takes 3 arguments (the value,
    *     the key and the object) and should return a boolean.
    * @param {T=} opt_this An optional "this" context for the function.
    * @return {string|undefined} The key of an element for which the function
    *     returns true or undefined if no such element is found.
    * @template T,K,V
    */
   Bee.Object.findKey = function (obj, f, opt_this)
   {
      for (var key in obj)
      {
         if (f.call(/** @type {?} */ (opt_this), obj[key], key, obj))
         {
            return key;
         }
      }
      return undefined;
   };

   /**
    * Searches an object for an element that satisfies the given condition and
    * returns its value.
    * @param {Object<K,V>} obj The object to search in.
    * @param {function(this:T,V,string,Object<K,V>):boolean} f The function
    *     to call for every element. Takes 3 arguments (the value, the key
    *     and the object) and should return a boolean.
    * @param {T=} opt_this An optional "this" context for the function.
    * @return {V} The value of an element for which the function returns true or
    *     undefined if no such element is found.
    * @template T,K,V
    */
   Bee.Object.findValue = function (obj, f, opt_this)
   {
      var key = Bee.Object.findKey(obj, f, opt_this);
      return key && obj[key];
   };

   /**
    * Whether the object/map/hash is empty.
    *
    * @param {Object} obj The object to test.
    * @return {boolean} true if obj is empty.
    */
   Bee.Object.isEmpty = function (obj)
   {
      for (var key in obj)
      {
         return false;
      }
      return true;
   };

   /**
    * Removes all key value pairs from the object/map/hash.
    *
    * @param {Object} obj The object to clear.
    */
   Bee.Object.clear = function (obj)
   {
      for (var i in obj)
      {
         delete obj[i];
      }
   };

   /**
    * Removes all key value pairs from the object/map/hash.
    *
    * @param {Object} obj The object to clear.
    */
   Bee.Object.destroy = function (obj)
   {
      for (var i in obj)
      {
         delete obj[i];
      }
   };

   /**
    * Removes a key-value pair based on the key.
    *
    * @param {Object} obj The object from which to remove the key.
    * @param {?} key The key to remove.
    * @return {boolean} Whether an element was removed.
    */
   Bee.Object.remove = function (obj, key)
   {
      var rv;
      if (rv = key in /** @type {!Object} */ (obj))
      {
         delete obj[key];
      }
      return rv;
   };

   /**
    * Adds a key-value pair to the object. Throws an exception if the key is
    * already in use. Use set if you want to change an existing pair.
    *
    * @param {Object<K,V>} obj The object to which to add the key-value pair.
    * @param {string} key The key to add.
    * @param {V} val The value to add.
    * @template K,V
    */
   Bee.Object.add = function (obj, key, val)
   {
      if (obj !== null && key in obj)
      {
         throw Error('The object already contains the key "' + key + '"');
      }
      Bee.Object.set(obj, key, val);
   };

   /**
    * Returns the value for the given key.
    *
    * @param {Object<K,V>} obj The object from which to get the value.
    * @param {string} key The key for which to get the value.
    * @param {R=} opt_val The value to return if no item is found for the given
    *     key (default is undefined).
    * @return {V|R|undefined} The value for the given key.
    * @template K,V,R
    */
   Bee.Object.get = function (obj, key, opt_val)
   {
      if (obj !== null && key in obj)
      {
         return obj[key];
      }
      return opt_val;
   };

   /**
    * Adds a key-value pair to the object/map/hash.
    *
    * @param {Object<K,V>} obj The object to which to add the key-value pair.
    * @param {string} key The key to add.
    * @param {V} value The value to add.
    * @template K,V
    */
   Bee.Object.set = function (obj, key, value)
   {
      obj[key] = value;
   };

   /**
    * Adds a key-value pair to the object/map/hash if it doesn't exist yet.
    *
    * @param {Object<K,V>} obj The object to which to add the key-value pair.
    * @param {string} key The key to add.
    * @param {V} value The value to add if the key wasn't present.
    * @return {V} The value of the entry at the end of the function.
    * @template K,V
    */
   Bee.Object.setIfUndefined = function (obj, key, value)
   {
      return key in /** @type {!Object} */ (obj) ? obj[key] : (obj[key] = value);
   };

   /**
    * Sets a key and value to an object if the key is not set. The value will be
    * the return value of the given function. If the key already exists, the
    * object will not be changed and the function will not be called (the function
    * will be lazily evaluated -- only called if necessary).
    *
    * This function is particularly useful for use with a map used a as a cache.
    *
    * @param {!Object<K,V>} obj The object to which to add the key-value pair.
    * @param {string} key The key to add.
    * @param {function():V} f The value to add if the key wasn't present.
    * @return {V} The value of the entry at the end of the function.
    * @template K,V
    */
   Bee.Object.setWithReturnValueIfNotSet = function (obj, key, f)
   {
      if (key in obj)
      {
         return obj[key];
      }

      var val = f();
      obj[key] = val;
      return val;
   };

   /**
    * Compares two objects for equality using === on the values.
    *
    * @param {!Object<K,V>} a
    * @param {!Object<K,V>} b
    * @return {boolean}
    * @template K,V
    */
   Bee.Object.equals = function (a, b)
   {
      for (var k in a)
      {
         if (!(k in b) || a[k] !== b[k])
         {
            return false;
         }
      }
      for (var k in b)
      {
         if (!(k in a))
         {
            return false;
         }
      }
      return true;
   };

   /**
    * Returns a shallow clone of the object.
    *
    * @param {Object<K,V>} obj Object to clone.
    * @return {!Object<K,V>} Clone of the input object.
    * @template K,V
    */
   Bee.Object.clone = function (obj)
   {
      // We cannot use the prototype trick because a lot of methods depend on where
      // the actual key is set.

      if (obj === null)
      {
         return null;
      }

      var res = {};
      for (var key in obj)
      {
         res[key] = obj[key];
      }
      return res;
      // We could also use Bee.mixin but I wanted this to be independent from that.
   };

   /**
    * Clones a value. The input may be an Object, Array, or basic type. Objects and
    * arrays will be cloned recursively.
    *
    * WARNINGS:
    * <code>Bee.Object.unsafeClone</code> does not detect reference loops. Objects
    * that refer to themselves will cause infinite recursion.
    *
    * <code>Bee.Object.unsafeClone</code> is unaware of unique identifiers, and
    * copies UIDs created by <code>getUid</code> into cloned results.
    *
    * @param {*} obj The value to clone.
    * @return {*} A clone of the input value.
    */
   Bee.Object.unsafeClone = function (obj)
   {
      var type = Bee.typeOf(obj);
      if (type == 'object' || type == 'array')
      {
         if (Bee.isFunction(obj.clone))
         {
            return obj.clone();
         }
         var clone = type == 'array' ? [] : {};
         for (var key in obj)
         {
            clone[key] = Bee.Object.unsafeClone(obj[key]);
         }
         return clone;
      }

      return obj;
   };

   /**
    * Returns a new object in which all the keys and values are interchanged
    * (keys become values and values become keys). If multiple keys map to the
    * same value, the chosen transposed value is implementation-dependent.
    *
    * @param {Object} obj The object to transpose.
    * @return {!Object} The transposed object.
    */
   Bee.Object.transpose = function (obj)
   {
      var transposed = {};
      for (var key in obj)
      {
         transposed[obj[key]] = key;
      }
      return transposed;
   };

   /**
    * Extends an object with another object.
    * This operates 'in-place'; it does not create a new Object.
    *
    * Example:
    * var o = {};
    * Bee.Object.extend(o, {a: 0, b: 1});
    * o; // {a: 0, b: 1}
    * Bee.Object.extend(o, {b: 2, c: 3});
    * o; // {a: 0, b: 2, c: 3}
    *
    * @param {Object} target
    *     {@code var_args}.
    * @param {...Object} var_args The objects from which values will be copied.
    * @deprecated use{@link Bee.Object.extend | @link Bee.Utils.extend } instead
    */
   Bee.Object.extendss = function (target, var_args)
   {
      var key, source;
      for (var i = 1; i < arguments.length; i++)
      {
         source = arguments[i];
         for (key in source)
         {
            target[key] = source[key];
         }

         // For IE the for-in-loop does not contain any properties that are not
         // enumerable on the prototype object (for example isPrototypeOf from
         // Object.prototype) and it will also not include 'replace' on objects that
         // extend String and change 'replace' (not that it is common for anyone to
         // extend anything except Object).

         for (var j = 0; j < Bee.Object.PROTOTYPE_FIELDS.length; j++)
         {
            key = Bee.Object.PROTOTYPE_FIELDS[j];
            if (Object.prototype.hasOwnProperty.call(source, key))
            {
               target[key] = source[key];
            }
         }
      }
   };

   /**
    * Extend an object with the members of another
    * This copying is done in place
    * Example:
    * var o = {};
    * Bee.Object.extend(o, {a: 0, b: 1});
    * o; // {a: 0, b: 1}
    * Bee.Object.extend(o, {b: 2, c: 3});
    * o; // {a: 0, b: 2, c: 3}
    * @param dest {Object} The object to modify. Existing properties will be
    *     overwritten if they are also present in one of the objects in
    *     If the dest is a falsie value the method will return the src object
    * @param src {Object|Array<Object>} The object or array of objects from which values will be copied.
    * @param {Boolean} [strict]
    * @returns {*}
    */
   Bee.Object.extend = function (dest, src, strict)
   {
      //var key;
      if (!dest)
      {
         dest = {};
      }
      let copySrcToDest = function (dest, src)
      {
         for (let key in src)
         {
            if (strict)
            {
               if (src.hasOwnProperty(key))
               { dest[key] = src[key]; }
            }
            else
            {
               dest[key] = src[key];
            }
         }
      };

      if (!(Bu.isArray(src)))
      {
         copySrcToDest(dest, src);
      }
      else
      {
         Ba.forEach(src, function (src)
         {
            copySrcToDest(dest, src);
         });
      }
      copySrcToDest = null;
      return dest;
   };

   /**
    * Deep merge two or more objects and return a third object. If the first argument is
    * true, the contents of the second object is copied into the first object.
    * Previously this function redirected to jQuery.extend(true), but this had two limitations.
    * First, it deep merged arrays, which lead to workarounds in {@link Highcharts}. Second,
    * it copied properties from extended prototypes.
    * @param var_args<Object>
    */
   Bee.Object.merge = function (var_args)
   {
      let i,
          args   = arguments,
          len,
          ret    = {},
          doCopy = function (copy, original)
          {
             var value, key;

             // An object is replacing a primitive
             if (typeof copy !== 'object')
             {
                copy = {};
             }

             for (key in original)
             {
                if (original.hasOwnProperty(key))
                {
                   value = original[key];

                   // Copy the contents of objects, but not arrays or DOM nodes
                   if (Bu.isObject(value, true) &&
                       key !== 'renderTo' && typeof value.nodeType !== 'number')
                   {
                      copy[key] = doCopy(copy[key] || {}, value);

                      // Primitives and arrays are copied over directly
                   }
                   else
                   {
                      copy[key] = original[key];
                   }
                }
             }
             return copy;
          };

      // If first argument is true, copy into the existing object. Used in setOptions.
      if (args[0] === true)
      {
         ret = args[1];
         args = Array.prototype.slice.call(args, 2);
      }

      // For each argument, extend the return
      len = args.length;
      for (i = 0; i < len; i++)
      {
         ret = doCopy(ret, args[i]);
      }

      return ret;
   };

   Bee.Object.deepMerge = function (target, source, optionsArgument)
   {

      /**
       *
       * @param val
       * @returns {*|boolean}
       */
      function isMergeableObject(val)
      {
         let nonNullObject = val && typeof val === 'object';

         return nonNullObject
                && Object.prototype.toString.call(val) !== '[object RegExp]'
                && Object.prototype.toString.call(val) !== '[object Date]';
      }

      /**
       *
       * @param val
       * @returns {*}
       */
      function emptyTarget(val)
      {
         return Array.isArray(val) ? [] : {};
      }

      /**
       *
       * @param value
       * @param optionsArgument
       * @returns {*}
       */
      function cloneIfNecessary(value, optionsArgument)
      {
         var clone = optionsArgument && optionsArgument.clone === true;
         return (clone && isMergeableObject(value)) ? Bee.Object.deepMerge(emptyTarget(value), value, optionsArgument) : value;
      }

      /**
       *
       * @param target
       * @param source
       * @param optionsArgument
       */
      function defaultArrayMerge(target, source, optionsArgument)
      {
         var destination = target.slice();
         source.forEach(function (e, i)
                        {
                           if (typeof destination[i] === 'undefined')
                           {
                              destination[i] = cloneIfNecessary(e, optionsArgument);
                           }
                           else if (isMergeableObject(e))
                           {
                              destination[i] = Bee.Object.deepMerge(target[i], e, optionsArgument);
                           }
                           else if (target.indexOf(e) === -1)
                           {
                              destination.push(cloneIfNecessary(e, optionsArgument));
                           }
                        });
         return destination;
      }

      function mergeObject(target, source, optionsArgument)
      {
         var destination = {};
         if (isMergeableObject(target))
         {
            Object.keys(target).forEach(function (key)
                                        {
                                           destination[key] = cloneIfNecessary(target[key], optionsArgument);
                                        });
         }
         Object.keys(source).forEach(function (key)
                                     {
                                        if (!isMergeableObject(source[key]) || !target[key])
                                        {
                                           destination[key] = cloneIfNecessary(source[key], optionsArgument);
                                        }
                                        else
                                        {
                                           destination[key] = Bee.Object.deepMerge(target[key], source[key], optionsArgument);
                                        }
                                     });
         return destination;
      }

      var array = Array.isArray(source);
      var options = optionsArgument || { arrayMerge : defaultArrayMerge };
      var arrayMerge = options.arrayMerge || defaultArrayMerge;

      if (array)
      {
         return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument);
      }
      else
      {
         return mergeObject(target, source, optionsArgument);
      }
   };

   /*Bee.Object.extendClone = function (a, b)FIXME
   {
      Bu.extend(a, b)
   };*/

   /**
    * Creates a new object built from the key-value pairs provided as arguments.
    * @param {...*} var_args If only one argument is provided and it is an array
    *     then this is used as the arguments,  otherwise even arguments are used as
    *     the property names and odd arguments are used as the property values.
    * @return {!Object} The new object.
    * @throws {Error} If there are uneven number of arguments or there is only one
    *     non array argument.
    */
   Bee.Object.create = function (var_args)
   {
      var argLength = arguments.length;
      if (argLength === 1 && Bee.isArray(arguments[0]))
      {
         return Bee.Object.create.apply(null, arguments[0]);
      }

      if (argLength % 2)
      {
         throw Error('Uneven number of arguments');
      }

      var rv = {};
      for (var i = 0; i < argLength; i += 2)
      {
         rv[arguments[i]] = arguments[i + 1];
      }
      return rv;
   };

   /**
    * Ctor === Creator
    * @use mimics {@link Object.create}
    * @param prototype
    * @returns {Creator}
    */
   Bee.Object.createObject = function (prototype)
   {
      /**
       *
       * @constructor
       */
      function Creator()
      {}

      Creator.prototype = prototype;
      return new Creator();
   };

   /**
    * Creates a new object where the property names come from the arguments but
    * the value is always set to true
    * @param {...*} var_args If only one argument is provided and it is an array
    *     then this is used as the arguments,  otherwise the arguments are used
    *     as the property names.
    * @return {!Object} The new object.
    */
   Bee.Object.createSet = function (var_args)
   {
      var argLength = arguments.length;
      if (argLength === 1 && Bee.isArray(arguments[0]))
      {
         return Bee.Object.createSet.apply(null, arguments[0]);
      }

      var rv = {};
      for (var i = 0; i < argLength; i++)
      {
         rv[arguments[i]] = true;
      }
      return rv;
   };

   /**
    * Creates an immutable view of the underlying object, if the browser
    * supports immutable objects.
    *
    * In default mode, writes to this view will fail silently. In strict mode,
    * they will throw an error.
    *
    * @param {!Object<K,V>} obj An object.
    * @return {!Object<K,V>} An immutable view of that object, or the
    *     original object if this browser does not support immutables.
    * @template K,V
    */
   Bee.Object.createImmutableView = function (obj)
   {
      var result = obj;
      if (Object.isFrozen && !Object.isFrozen(obj))
      {
         result = Object.create(obj);
         Object.freeze(result);
      }
      return result;
   };

   /**
    * @param {!Object} obj An object.
    * @return {boolean} Whether this is an immutable view of the object.
    */
   Bee.Object.isImmutableView = function (obj)
   {
      return Object.isFrozen && Object.isFrozen(obj);
   };

})();