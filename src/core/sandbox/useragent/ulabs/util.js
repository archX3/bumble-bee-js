// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities used by Barge.uLabs.userAgent tools. These functions
 * should not be used outside of Barge.uLabs.userAgent.*.
 *
 *
 * @author nnaze@Bargele.com (Nathan Naze)
 */

// Barge.provide('Barge.uLabs.userAgent.util');
//
// Barge.require('Barge.string');
Barge.uLabs = Barge.uLabs || {};
Barge.uLabs.userAgent = Barge.uLabs.userAgent || {};
Barge.uLabs.userAgent.util = Barge.uLabs.userAgent.util || {};

/**
 * Gets the native userAgent string from navigator if it exists.
 * If navigator or navigator.userAgent string is missing, returns an empty
 * string.
 * @return {string}
 * @private
 */
Barge.uLabs.userAgent.util._getNativeUserAgentString = function() {
  var navigator = Barge.uLabs.userAgent.util._getNavigator();
  if (navigator) {
    var userAgent = navigator.userAgent;
    if (userAgent) {
      return userAgent;
    }
  }
  return '';
};


/**
 * Getter for the native navigator.
 * This is a separate function so it can be stubbed out in testing.
 * @return {Navigator}
 * @private
 */
Barge.uLabs.userAgent.util._getNavigator = function() {
  return Barge.global.navigator;
};


/**
 * A possible override for applications which wish to not check
 * navigator.userAgent but use a specified value for detection instead.
 * @private {string}
 */
Barge.uLabs.userAgent.util.userAgent_ =
    Barge.uLabs.userAgent.util._getNativeUserAgentString();


/**
 * Applications may override browser detection on the built in
 * navigator.userAgent object by setting this string. Set to null to use the
 * browser object instead.
 * @param {?string=} opt_userAgent The User-Agent override.
 */
Barge.uLabs.userAgent.util.setUserAgent = function(opt_userAgent) {
  Barge.uLabs.userAgent.util.userAgent_ =
      opt_userAgent || Barge.uLabs.userAgent.util._getNativeUserAgentString();
};


/**
 * @return {string} The user agent string.
 */
Barge.uLabs.userAgent.util.getUserAgent = function() {
  return Barge.uLabs.userAgent.util.userAgent_;
};


/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string, ignoring
 *     case.
 */
Barge.uLabs.userAgent.util.matchUserAgent = function(str) {
  var userAgent = Barge.uLabs.userAgent.util.getUserAgent();
  return Barge.string.contains(userAgent, str);
};


/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string.
 */
Barge.uLabs.userAgent.util.matchUserAgentIgnoreCase = function(str) {
  var userAgent = Barge.uLabs.userAgent.util.getUserAgent();
  return Barge.string.caseInsensitiveContains(userAgent, str);
};


/**
 * Parses the user agent into tuples for each section.
 * @param {string} userAgent
 * @return {!Array<!Array<string>>} Tuples of key, version, and the contents
 *     of the parenthetical.
 */
Barge.uLabs.userAgent.util.extractVersionTuples = function(userAgent) {
  // Matches each section of a user agent string.
  // Example UA:
  // Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us)
  // AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405
  // This has three version tuples: Mozilla, AppleWebKit, and Mobile.

  var versionRegExp = new RegExp(
      // Key. Note that a key may have a space.
      // (i.e. 'Mobile Safari' in 'Mobile Safari/5.0')
      '(\\w[\\w ]+)' +

          '/' +                // slash
          '([^\\s]+)' +        // version (i.e. '5.0b')
          '\\s*' +             // whitespace
          '(?:\\((.*?)\\))?',  // parenthetical info. parentheses not matched.
      'g');

  var data = [];
  var match;

  // Iterate and collect the version tuples.  Each iteration will be the
  // next regex match.
  while (match = versionRegExp.exec(userAgent)) {
    data.push([
      match[1],  // key
      match[2],  // value
      // || undefined as this is not undefined in IE7 and IE8
      match[3] || undefined  // info
    ]);
  }

  return data;
};
