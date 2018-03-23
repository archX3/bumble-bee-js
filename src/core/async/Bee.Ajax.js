/**
 * Created by ARCH on 2/16/17.
 * @Copyright (C) 2016
 * Barge Studios Inc, The Bumble-Bee Authors
 * <bargestd@gmail.com>
 * <bumble.bee@bargestd.com>
 *
 * @licence Licensed under the Barge Studios Eula
 *  you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *     http://www.bargestudios.com/bumblebee/licence
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
 * @fileOverview constructor and associated methods for creating and managing
 * a tabbed view
 * @requires {@link Barge.Utils, @link  Barge.String, @link  Barge.Object, @link  Barge.Widget< @link Barge.Timer}
 *
 *
 * @user msg: Some lines in this file use constructs from es6 or later
 */
//var Bee = Bee || {};

(function (global, factory)
{
   if (typeof define === 'function' && define.amd)
   {
      // AMD. Register as an anonymous module unless amdModuleId is set
      define([], function ()
      {
         return (global['Barge.Ajax'] = factory(global));
      });
   }
   else if (typeof exports === 'object')
   {
      // Node. Does not work with strict CommonJS, but
      // only CommonJS-like environments that support module.exports,
      // like Node.
      module.exports = factory(global);
   }
   else
   {
      global['Barge.Ajax'] = factory(global);
   }
})(typeof window !== undefined ? window : this, function factory(window)
{
   "use strict";

   let Bu = Bee.Utils,
       Bo = Bee.Object;

   /**
    * @class
    */
   class Ajax {
      /**
       *
       * @param options {{baseUrl : String,
            data    : {},
            method  : "GET"} | null}
       * @constructor
       */
      constructor(options = null)
      {
         this.options = {
            baseUrl : "",
            data    : null,
            method  : "GET"
         };

         if (options)
         {
            this.options = Bo.extend(this.options, options);
         }

         this.request = null;
         return this;
      }

      /**
       *
       * @returns {XMLHttpRequest}
       */
      static createXHR()
      {
         let xhr = null;

         try
         {
            if (window.XMLHttpRequest)
            {
               xhr = new XMLHttpRequest();
            }
            else if (window.ActiveXObject)
            {
               xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
         }
         catch (e)
         {
            xhr = null;
         }

         return xhr;
      };

      /**
       *
       * @param options{{url : string, method : string, target : Element, title : string, error : fn,  success : fn, abort : fn, progress : fn, progressElement : Element|null, data: {}, status : { code : fn, 404 : fn, 200 : fn, ...} }}
       * @returns {XMLHttpRequest}
       */
      send(options)
      {
         this.request = Ajax.createXHR();
         this.queryString = "";
         this.formData = null;

         let self    = this,
             request = this.request;


         if (options)
         {
            this.options = Bo.extend(this.options, options);
         }

         this.request.onreadystatechange = function ()
         {
            if (request.readyState === 4 && request.status === 200)
            {
               if (self.options.success && Bu.isFunction(self.options.success))
               {
                  self.options.success(request);
               }
            }
            if (request.status === 404)
            {
               if (self.options.error && Bu.isFunction(self.options.error))
               {
                  self.options.error(request);
               }
            }

            if (Bu.defined(self.options.status) && !Bo.isEmpty(self.options.status))
            {
               for (let key in self.options.status) //issue linear search my need improvement
               {
                  if (self.options.status.hasOwnProperty(key))
                  {
                     if (request.status.toString() === key && Bu.isFunction(self.options.status[key]))
                     {
                        self.options.status[key](request); //call the status code callback and pass it the request object
                     }
                  }
               }

            }
         };

         //NIU atm
         //request.onerror = function ()
         //{
         //   if (Bu.defined(self.options.error) && Bu.isFunction(self.options.error))
         //   {
         //      self.options.error(request);
         //   }
         //};
         //
         //request.onabort = function ()
         //{
         //   if (Bu.defined(self.options.abort) && Bu.isFunction(self.options.abort))
         //   {
         //      self.options.abort(request);
         //   }
         //};
         //
         //request.onprogress = function ()
         //{
         //   if (Bu.defined(self.options.progress))
         //   {
         //      self.options.progress(request);
         //   }
         //   else if (Bu.defined(self.options.onProgress))
         //   {
         //      self.options.onProgress(request);
         //   }
         //};

         //open the request object
         request.open(this.options.method,
            this.options.baseUrl + this.options.url + self.toQueryString(self.options.data), true);

         //issue need to find a way to send multiple headers cos calling RequestHeader multiple times
         //issue concatenates the first header value and breaks the request
         // set the necessary headers
         //this.setHeaders(request, self.options.headers);

         //create form data
         let formData = new FormData();
         for (let name in self.options.data)
         {
            if(self.options.data.hasOwnProperty(name))
            {
               formData.append(name, self.options.data[name]);
            }
         }

         //now that all data have been passed and headers set, we can send the request
         request.send(formData);

         return this;
      };

      abort()
      {
         this.request.abort();
         return this;
      };

      //send()
      //{
      //
      //};

      makeQueryString(object)
      {
         let firstKey = Object.keys(object)[0];

         this.queryString = "?";

         this.queryString += firstKey + "=" + Ajax.encode(object[firstKey]);

         for (let key in object)
         {
            this.queryString += "&" + key + "=" + Ajax.encode(object[key]);
         }
      }

      getQueryString(object)
      {
         this.makeQueryString(object);
         return this.queryString;
         //Object.keys(object).reduce(function (acc, item){//var prefix = ;//return (!acc ? '' : acc + '&') +
         // self.encode(item) + '=' + self.encode(object[item])//}, '')
      };

      static encode(value)
      {
         return encodeURIComponent(value);
      };

      static hasContentType(headers)
      {  //return Bu.defined(headers["Content-Type"])
         return Object.keys(headers).some(function (name)
                                          {return name.toLowerCase() === 'content-type';});
      };

      setHeaders(xhr, headers = {})
      {
         let self = this;
         //headers = headers || {};
         if (!Ajax.hasContentType(headers))
         {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
         }
         Object.keys(headers).forEach(function (name)
                                      {
                                         (headers[name] && self.request.setRequestHeader(name, headers[name]));
                                      });
         return this;
      };

      toQueryString(data)
      {
         //this.makeQueryString(data);
         return Bu.isObject(data) ? this.getQueryString(data) : data;
      };
   }
   //going public whoop! whoop! lol
   return Bee.Ajax = Ajax;
});



