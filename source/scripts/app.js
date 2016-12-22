/**
 * require jQuery.
 */

jQuery(document).ready(function ($) {

    function ZzzFM() {
        /**
         * localStorage
         * @param this.data.id {Number}
         * @param this.data.tid {Number}
         * @param this.data.type {String}
         * @param this.data.bone {String}
         * @param this.data.timestamp {Number}
         * @param this.data.cacheIDs {Array}
         */
        this.data = {
            type: null, // @stable
            cacheIDs: [] // @stable
        };
        this.options = {};
        this.jqXHRs = {
            loadAudioMisc: null,
            loadRemoteIDs: null,
            loadMusicInfo: null
        };
        this.recursion = {
            currentTime: null,
            startType: null,
            needCheck: false
        };
        this.config = {
            retry: 3,
            volume: 0.5,
            expire: 1200,
            doneCode: 200,
            thumbnail: 360,
            localName: 'ZzzFM.logger',
            source: 'https://github.com/Aqours/ZzzFM',
            interface: 'request.php',
            audioMisc: 'audio-misc.json',
            typeMap: ['detail', 'album', 'artist', 'playlist']
        };
        this.domNodes = {
            home: document.querySelector('#controller [data-id="fa-home"] .fa-button'),
            over: document.querySelector('#controller [data-id="fa-over"] .fa-button'),
            img: document.querySelector('#surface .cover img'),
            name: document.querySelector('#detail .name'),
            magic: document.querySelector('#surface .magic'),
            artists: document.querySelector('#detail .artists'),
            elapsed: document.querySelector('#thread .elapsed'),
            surface: document.querySelector('#surface'),
            faMagic: document.querySelector('#surface .magic .fa')
        };
        this.tried = 0;
        this.audio = document.createElement('audio');
        this.audio.volume = this.config.volume;
        this.decorator();
    }

    ZzzFM.shuffle = function (items, isOwn) {
        var copy = isOwn ? items : items.slice();
        var len = copy.length;
        var randomIndex, buffer;

        while (len) {
            randomIndex = Math.floor(Math.random() * len);
            buffer = copy[--len];
            copy[len] = copy[randomIndex];
            copy[randomIndex] = buffer;
        }

        return copy;
    };

    $.extend(ZzzFM.prototype, {

        decorator: function () {
            this.getLatestData();
            this.loadAudioMisc();
            this.addAudioEvents();
            this.addOtherEvents();
        },

        getLatestData: function () {
            var latestData = this.getLocalData();

            $.isPlainObject(latestData) && latestData.bone && (this.data = latestData);
            !Array.isArray(this.data.cacheIDs) && (this.data.cacheIDs = []);
            this.config.typeMap.indexOf(this.data.type) === -1 && this.setDataType(this.config.typeMap[0]);
        },

        loadAudioMisc: function () {
            this.jqXHRs.loadAudioMisc = $.ajax({
                url: this.config.audioMisc,
                cache: true,
                context: this,
                dataType: 'json'
            }).done(function (raw, textStatus, jqXHR) {
                var bone = jqXHR.getResponseHeader('ETag') || jqXHR.getResponseHeader('Last-Modified');

                if (bone) {
                    if (bone !== this.data.bone) {
                        this.data.bone = bone;
                        this.data.cacheIDs = [];
                    }
                } else {
                    this.data.bone = null;
                    console.info('ETag or Last-Modified NOT in Response Headers');
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.error(errorThrown);
            }).done(function (raw) {
                this.blendOptions(raw);
            });
        },

        blendOptions: function (raw) {
            var total = 0;
            var isCheckout = this.checkRawData(raw) && $.isPlainObject(raw.data);
            var filter = function (prop) {
                if (typeof prop === 'number') {
                    return [prop];
                }
                if (Array.isArray(prop)) {
                    return prop.filter(function (item) {
                        return typeof item === 'number';
                    });
                }
                return [];
            };

            this.config.typeMap.forEach(function (name) {
                this.options[name] = isCheckout ? filter(raw.data[name]) : [];
                total += this.options[name].length;
            }, this);

            if (total) {
                this.getHyperIDs(this.data.id);
            } else { // Prevent Infinite Recursion
                throw new Error('ZzzFM: Unexpected JSON Data');
            }
        },

        /**
         * @recursion
         */
        getHyperIDs: function (id, isRecursion) {
            var deferred = null;
            var index = this.data.cacheIDs.indexOf(this.data.id);
            var result = typeof id === 'number' ? [id] : this.data.cacheIDs.slice(index + 1, index + 2);

            !isRecursion && (this.recursion.startType = this.data.type);

            if (result.length) {
                this.setRecursionCheck(false);
                this.loadMusicInfo(result);
            } else {
                deferred = this.loadNextBit();
                deferred && deferred.done(function (raw) {
                    this.checkRawData(raw) && Array.isArray(raw.data) && (this.data.cacheIDs = raw.data);

                    // Prevent Infinite Recursion
                    // By `this.typeMap.length > 1`
                    // By `this.recursion` and `this.data.type`
                    // By `this.setDataType` and `this.setRecursionCheck`
                    if (this.recursion.needCheck && this.recursion.startType === this.data.type) {
                        console.warn('Infinite Recursion Canceled');
                    } else {
                        this.getHyperIDs(null, true);
                    }
                });
            }
        },

        loadMusicInfo: function (result) {
            var injectData = {};
            injectData[this.config.typeMap[0]] = result;

            this.jqXHRs.loadMusicInfo && this.jqXHRs.loadMusicInfo.state() === 'pending' && this.jqXHRs.loadMusicInfo.abort();
            this.jqXHRs.loadMusicInfo = $.ajax({
                url: this.config.interface,
                data: injectData,
                cache: true,
                context: this,
                dataType: 'json'
            }).done(function (raw) {
                this.checkRawData(raw) && this.renderAudio(raw.data[0]);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.info(errorThrown);
            });
        },

        renderAudio: function (song) {
            if ($.isPlainObject(song)) {
                if (song['url']) {
                    this.domNodes.img.src = this.getImagePackage(song['album']['picUrl']);
                    this.domNodes.name.textContent = song['name'];
                    this.domNodes.artists.textContent = song['artists'];
                    this.audio.src = song['url'];
                    this.audio.sourcePointer = song;
                    this.data.id = song['id'];
                    this.playAudio();
                } else {
                    this.tried++ < this.config.retry && this.nextTrack();
                    console.info('Continuity Count Error:', this.tried);
                }
            } else {
                console.warn('Invalid Song Data');
            }
        },

        getImagePackage: function (picUrl) {
            return picUrl + '?' + this.config.thumbnail + 'y' + this.config.thumbnail;
        },

        /**
         * @recursion
         */
        loadNextBit: function () {
            var deferred = null;
            var injectData = {};
            var typeIndex = this.config.typeMap.indexOf(this.data.type);
            var tidIndex = this.options[this.data.type].indexOf(this.data.tid);
            var tidMaxIndex = this.options[this.data.type].length - 1;

            if (tidIndex + 1 > tidMaxIndex) {
                this.setDataType(this.config.typeMap[typeIndex + 1 > this.config.typeMap.length - 1 ? 0 : typeIndex + 1]);

                // Prevent Infinite Recursion
                // By `this.setDataType`
                // By checkout total length in `this.blendOptions`
                return this.loadNextBit();
            }

            if (this.jqXHRs.loadRemoteIDs && this.jqXHRs.loadRemoteIDs.state() === 'pending') {
                return null;
            } else {
                if (this.data.type === this.config.typeMap[0]) {
                    this.data.tid = this.options[this.data.type][tidMaxIndex];
                    deferred = $.Deferred();
                    deferred.resolveWith(this, [{
                        code: this.config.doneCode,
                        data: this.options[this.data.type]
                    }]);
                    return deferred;
                } else {
                    this.data.tid = this.options[this.data.type][tidIndex + 1];
                    injectData[this.data.type] = this.data.tid;
                    this.jqXHRs.loadRemoteIDs = $.ajax({
                        url: this.config.interface,
                        data: injectData,
                        cache: true,
                        context: this,
                        dataType: 'json'
                    });
                    return this.jqXHRs.loadRemoteIDs;
                }
            }
        },

        /**
         * Use this to set `this.data.type`
         * DO NOT set `this.data.type` directly
         */
        setDataType: function (type) {
            this.data.id = null;
            this.data.tid = null;
            this.data.type = type;
            this.setRecursionCheck(true);
        },

        setRecursionCheck: function (value) {
            this.recursion.isBridge = value;
        },

        checkRawData: function (raw) {
            if ($.isPlainObject(raw) && raw.code === this.config.doneCode) {
                return true;
            } else {
                console.warn('Invalid Raw Data');
                return false;
            }
        },

        getLocalData: function () {
            try {
                return JSON.parse(localStorage.getItem(this.config.localName));
            } catch (e) {
                console.warn(e.message);
                return null;
            }
        },

        setLocalData: function () {
            if (this.data.bone) {
                var data = $.extend(this.data, {
                    timestamp: Date.now()
                });

                try {
                    localStorage.setItem(this.config.localName, JSON.stringify(data));
                } catch (e) {
                    console.warn(e.message);
                }
            }
        },

        /**
         * @recursion
         */
        playAudio: function () {
            var time = Math.ceil(Date.now() / 1000);
            var song = this.audio.sourcePointer;
            var rest = this.audio.duration - this.audio.currentTime; // Maybe `NaN`
            var minExpire = this.audio.duration || 120;
            var expire = song['expire'] < minExpire ? this.config.expire : song['expire'];
            var isExpire = time - song['timestamp'] + Math.ceil(rest || 0) > expire;

            // NO risk of recursion
            if (isExpire) {
                this.recursion.currentTime = this.audio.currentTime;
                this.nextTrack(song['id'])
            } else {
                if (this.recursion.currentTime) {
                    this.audio.currentTime = this.recursion.currentTime;
                    this.recursion.currentTime = null;
                }
                this.audio.play();
            }
        },

        pauseAudio: function () {
            this.audio.pause();
        },

        nextTrack: function (id) {
            this.pauseAudio();
            this.getHyperIDs(id);
        },

        addAudioEvents: function () {
            $(this.audio).on({
                'playing': function (e) {
                    $(e.data.domNodes.surface).attr('data-running', !e.data.audio.paused);
                    $(e.data.domNodes.faMagic).removeClass('fa-play').addClass('fa-pause');
                },
                'pause': function (e) {
                    $(e.data.domNodes.surface).attr('data-running', !e.data.audio.paused);
                    $(e.data.domNodes.faMagic).removeClass('fa-pause').addClass('fa-play');
                },
                'ended': function (e) {
                    e.data.nextTrack();
                },
                'timeupdate': function (e) {
                    $(e.data.domNodes.elapsed).css('width', (e.data.audio.currentTime / e.data.audio.duration).toFixed(5) * 100 + '%');
                },
                'error': function (e) {
                    console.warn(e.message);
                }
            }, this);
        },

        addOtherEvents: function () {
            $(window).on('unload', this, function (e) {
                e.data.setLocalData();
            });

            $(document).on('keydown', this, function (e) {
                if (e.ctrlKey && e.which === 39) { // Ctrl+Right
                    e.preventDefault();
                    e.data.nextTrack();
                }
            });

            $(this.domNodes.home).on('click', this, function (e) {
                window.open(e.data.config.source);
            });

            $(this.domNodes.over).on('click', this, function (e) {
                e.data.nextTrack();
            });

            $(this.domNodes.magic).on('click', this, function (e) {
                e.data.audio.paused ? e.data.playAudio() : e.data.pauseAudio();
            });

            $(this.domNodes.img).on('error', function () {
                this.src = $(this).attr('data-src');
            });
        }

    });


    new ZzzFM();

});
