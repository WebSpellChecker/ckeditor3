'use strict';
CKEDITOR.plugins.add('scayt', {

	requires : ['menubutton', 'dialog'],
	tabToOpen : null,
	dialogName: 'scaytDialog',
	init: function(editor) {
		//console.log('init');
		var self = this,
			plugin = CKEDITOR.plugins.scayt;

		this.bindEvents(editor);
		this.parseConfig(editor);
		this.addRule(editor);

		// source mode
		CKEDITOR.dialog.add(this.dialogName, CKEDITOR.getUrl(this.path + 'dialogs/options.js'));
		// end source mode

		this.addMenuItems(editor);
		var config = editor.config,
			lang = editor.lang.format;

		editor.ui.add('Scayt', CKEDITOR.UI_MENUBUTTON, {
			label : lang.title,
			title : CKEDITOR.env.opera ? lang.opera_title : lang.title,
			className : 'cke_button_scayt',
			modes : {wysiwyg: 1},
			onRender: function() {
				var that = this;
				var _editor = editor;
				var isLtIE10 = CKEDITOR.env.ie && CKEDITOR.env.version < 10;

				_editor.on('scaytButtonState', function(ev) {
					var _ev = ev;

					// bug in IE 8, 9 - state was not applied on scayt autostartup
					setTimeout(function() {
						if(typeof _ev.data != undefined) {
							that.setState(_ev.data);
						}
					}, isLtIE10 ? 500 : 50);
				});
			},
			onMenu : function() {
				var scaytInstance = editor.scayt;

				editor.getMenuItem('scaytToggle').label = editor.lang.scayt[(scaytInstance ? plugin.state[editor.name] : false) ? 'disable' : 'enable'];

				// If UI tab is disabled we shouldn't show menu item
				var menuDefinition = {
					scaytToggle  : CKEDITOR.TRISTATE_OFF,
					scaytOptions : scaytInstance ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED,
					scaytLangs   : scaytInstance ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED,
					scaytDict    : scaytInstance ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED,
					scaytAbout   : scaytInstance ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED
				};

				if(editor.config.scayt_uiTabs[0].toString() === '0') {
					delete menuDefinition.scaytOptions;
				}

				if(editor.config.scayt_uiTabs[1].toString() === '0') {
					delete menuDefinition.scaytLangs;
				}

				if(editor.config.scayt_uiTabs[2].toString() === '0') {
					delete menuDefinition.scaytDict;
				}

				return menuDefinition;
			}
		});

		// If the 'contextmenu' plugin is loaded, register the listeners.
		if(editor.contextMenu && editor.addMenuItems) {
			editor.contextMenu.addListener(function(element, selection) {
				var result = null,
					scaytInstance = editor.scayt;

				if(scaytInstance && !editor.readOnly) {
					// TODO: implement right lang getter
					var selectionNode = scaytInstance.getSelectionNode(),
						word;

					if(selectionNode) {
						word = selectionNode.getAttribute(scaytInstance.getNodeAttribute());
					} else {
						word = selectionNode;
					}

					// SCAYT shouldn't build context menu if instance isnot created or word is without misspelling
					if(word) {
						var items = self.menuGenerator(editor, word, self);

						scaytInstance.showBanner('.' + editor.contextMenu._.definition.panel.className.split(' ').join(' .'));
						result = items;
					}
				}

				return result;
			});

			editor.contextMenu._.onHide = CKEDITOR.tools.override(editor.contextMenu._.onHide, function(org) {
				return function() {
					var scaytInstance = editor.scayt;

					if(scaytInstance) {
						scaytInstance.hideBanner();
					}

					return org.apply(this);
				};
			});
		}
	},
	addMenuItems: function(editor) {
		var self = this,
			plugin = CKEDITOR.plugins.scayt,
			menuGroup = 'scaytButton';

		editor.addMenuGroup(menuGroup);

		var uiMenuItems = {
			scaytToggle: {
				label : editor.lang.scayt.enable,
				group : menuGroup,
				onClick : function() {
					var scaytInstance = editor.scayt;

					plugin.state[editor.name] = !plugin.state[editor.name];

					if(plugin.state[editor.name] === true) {
						if(!scaytInstance) {
							plugin.createScayt(editor);
						}
					} else {
						if(scaytInstance) {
							plugin.destroy(editor);
						}
					}
				}
			},
			scaytAbout: {
				label : editor.lang.scayt.about,
				group : menuGroup,
				onClick : function() {
					var scaytInstance = editor.scayt;

					scaytInstance.tabToOpen = 'about';
					editor.openDialog(self.dialogName);
				}
			},
			scaytOptions: {
				label : editor.lang.scayt.optionsTab,
				group : menuGroup,
				onClick : function() {
					var scaytInstance = editor.scayt;

					scaytInstance.tabToOpen = 'options';
					editor.openDialog(self.dialogName);
					//editor.openDialog(commandName);
				}
			},
			scaytLangs: {
				label : editor.lang.scayt.langs,
				group : menuGroup,
				onClick : function() {
					var scaytInstance = editor.scayt;

					scaytInstance.tabToOpen = 'langs';
					editor.openDialog(self.dialogName);
				}
			},
			scaytDict: {
				label : editor.lang.scayt.dictionariesTab,
				group : menuGroup,
				onClick : function() {
					var scaytInstance = editor.scayt;

					scaytInstance.tabToOpen = 'dictionaries';
					editor.openDialog(self.dialogName);
				}
			}
		};

		editor.addMenuItems(uiMenuItems);
	},
	beforeInit : function(editor) {
		var items_order = editor.config.scayt_contextMenuItemsOrder || 'suggest|moresuggest|control',
			items_order_str = '';

		items_order = items_order.split('|');

		if(items_order && items_order.length) {
			for(var pos = 0 ; pos < items_order.length ; pos++) {
				items_order_str += 'scayt_' + items_order[pos] + (items_order.length != pos + 1 ? ',' : '');
			}
		}

		// Put it on top of all context menu items (#5717)
		editor.config.menu_groups =  items_order_str + ',' + editor.config.menu_groups;
	},
	bindEvents: function(editor) {
		var self = this,
			plugin = CKEDITOR.plugins.scayt;

		editor.on('contentDom', function(ev) {
			// The event is fired when editable iframe node was reinited so we should restart our service
			if(plugin.state[editor.name] && !editor.readOnly) {
				plugin.createScayt(editor);
			}
		});

		editor.on('destroy', function(ev) {
			var scaytInstance = editor.scayt;

			if(scaytInstance) {
				plugin.destroy(editor);
			}
		});

		editor.on('beforeCommandExec', function(ev) {
			var scaytInstance = editor.scayt,
				forceBookmark = false,
				removeMarkupInsideSelection = true;

			// TODO: after switching in source mode not recreate SCAYT instance, try to just rerun markuping to don't make requests to server
			if(ev.data.name in plugin.options.disablingCommandExec && editor.mode == 'wysiwyg') {
				if(scaytInstance) {
					plugin.destroy(editor);
					editor.fire('scaytButtonState', CKEDITOR.TRISTATE_DISABLED);
				}
			} else if(	ev.data.name === 'bold' || ev.data.name === 'italic' || ev.data.name === 'underline' ||
						ev.data.name === 'strike' || ev.data.name === 'subscript' || ev.data.name === 'superscript' ||
						ev.data.name === 'cut') {
				if(scaytInstance) {
					if(ev.data.name === 'cut') {
						removeMarkupInsideSelection = false;
						// We need to force bookmark before we remove our markup.
						// Otherwise we will get issues with cutting text via context menu.
						forceBookmark = true;
					}

					editor.fire('reloadMarkupScayt', {
						removeOptions: {
							removeInside: removeMarkupInsideSelection,
							forceBookmark: forceBookmark
						},
						timeout: 0
					});
				}
			}
		});

		editor.on('beforeSetMode', function(ev) {
			var scaytInstance;
			// needed when we use:
			// CKEDITOR.instances.editor_ID.setMode("source")
			// CKEDITOR.instances.editor_ID.setMode("wysiwyg")
			// can't be implemented in editor.on('mode', function(ev) {});
			if(ev.data.newMode == 'source') {
				scaytInstance = editor.scayt;
				if(scaytInstance) {
					plugin.destroy(editor);
					editor.fire('scaytButtonState', CKEDITOR.TRISTATE_DISABLED);
				}

				// remove custom data from body, to prevent waste properties showing in IE8
				editor.document.getBody().removeAttribute('_jquid');
			}
		});

		editor.on('afterCommandExec', function(ev) {
			var scaytInstance;

			if(editor.mode == 'wysiwyg' && (ev.data.name == 'undo' || ev.data.name == 'redo')) {
				scaytInstance = editor.scayt;
				if(scaytInstance) {
					setTimeout(function() {
						plugin.reloadMarkup(scaytInstance);
					}, 250);
				}
			}
		});

		// handle readonly changes
		editor.on('readOnly', function(ev) {
			var scaytInstance;

			if(ev) {

				scaytInstance = ev.editor.scayt;

				if(ev.editor.readOnly) {
					if(scaytInstance) {
						// we need to destroy SCAYT plugin because CK replaces original body tag on readOnly toggle
						plugin.destroy(ev.editor);
						// and disable button
						ev.editor.fire('scaytButtonState', CKEDITOR.TRISTATE_DISABLED);
					}
				} else {
					if(scaytInstance) {
						plugin.reloadMarkup(scaytInstance);
					} else if(ev.editor.mode == 'wysiwyg' && plugin.state[ev.editor.name]) {
						setTimeout(function() {
							plugin.createScayt(ev.editor);
							ev.editor.fire('scaytButtonState', CKEDITOR.TRISTATE_ON);
						}, 200);
					}
				}
			}
		});

		//#9439 after SetData method fires contentDom event and SCAYT create additional instanse
		// This way we should destroy SCAYT on setData event when contenteditable Iframe was re-created
		editor.on('setData', function() {
			var scaytInstance = editor.scayt;

			if(scaytInstance) {
				plugin.destroy(editor);
			}
		}, this, null, 50);

		editor.on('reloadMarkupScayt', function(ev) {
			var scaytInstance = editor.scayt,
				removeOptions = ev.data && ev.data.removeOptions,
				timeout = ev.data && ev.data.timeout;

			if (scaytInstance) {
				scaytInstance.removeMarkupInSelectionNode(removeOptions);
				if(typeof timeout === 'number') {
					setTimeout(function() {
						plugin.reloadMarkup(scaytInstance);
					}, timeout);
				} else {
					plugin.reloadMarkup(scaytInstance);
				}
			}
		});

		// Reload spell-checking for current word after insertion completed.
		editor.on('insertElement', function() {
			editor.fire('reloadMarkupScayt', {removeOptions: {forceBookmark: true}});
		}, this, null, 50);

		editor.on('insertHtml', function() {
			editor.fire('reloadMarkupScayt');
		}, this, null, 50);

		editor.on('insertText', function() {
			editor.fire('reloadMarkupScayt');
		}, this, null, 50);

		// The event is listening to open necessary dialog tab
		editor.on('scaytDialogShown', function(ev) {
			var dialog = ev.data,
				scaytInstance = editor.scayt;

			dialog.selectPage(scaytInstance.tabToOpen);
		});
	},
	parseConfig: function(editor) {
		var plugin = CKEDITOR.plugins.scayt;

		// preprocess config for backward compatibility
		plugin.replaceOldOptionsNames(editor.config);

		// Checking editor's config after initialization
		if(typeof editor.config.scayt_autoStartup !== 'boolean') {
			editor.config.scayt_autoStartup = false;
		}
		plugin.state[editor.name] = editor.config.scayt_autoStartup;

		if(!editor.config.scayt_contextCommands) {
			editor.config.scayt_contextCommands = 'ignore|ignoreall|add';
		}

		if(!editor.config.scayt_sLang) {
			editor.config.scayt_sLang = 'en_US';
		}

		if(editor.config.scayt_maxSuggestions === undefined || typeof editor.config.scayt_maxSuggestions != 'number' || editor.config.scayt_maxSuggestions < 0) {
			editor.config.scayt_maxSuggestions = 5;
		}

		if(editor.config.scayt_minWordLength === undefined || typeof editor.config.scayt_minWordLength != 'number' || editor.config.scayt_minWordLength < 1) {
			editor.config.scayt_minWordLength = 4;
		}

		if(editor.config.scayt_customDictionaryIds === undefined || typeof editor.config.scayt_customDictionaryIds !== 'string') {
			editor.config.scayt_customDictionaryIds = '';
		}

		if(editor.config.scayt_userDictionaryName === undefined || typeof editor.config.scayt_userDictionaryName !== 'string') {
			editor.config.scayt_userDictionaryName = null;
		}

		if(typeof editor.config.scayt_uiTabs === 'string' && editor.config.scayt_uiTabs.split(',').length === 3) {
			editor.config.scayt_uiTabs = editor.config.scayt_uiTabs.split(',');
		} else {
			editor.config.scayt_uiTabs = [1,1,1];
		}

		if(typeof editor.config.scayt_serviceProtocol != 'string') {
			editor.config.scayt_serviceProtocol = null;
		}

		if(typeof editor.config.scayt_serviceHost != 'string') {
			editor.config.scayt_serviceHost = null;
		}

		if(typeof editor.config.scayt_servicePort != 'string') {
			editor.config.scayt_servicePort = null;
		}

		if(typeof editor.config.scayt_servicePath != 'string') {
			editor.config.scayt_servicePath = null;
		}

		if(!editor.config.scayt_moreSuggestions) {
			editor.config.scayt_moreSuggestions = 'on';
		}

		if(typeof editor.config.scayt_customerId !== 'string') {
			editor.config.scayt_customerId = '1:WvF0D4-UtPqN1-43nkD4-NKvUm2-daQqk3-LmNiI-z7Ysb4-mwry24-T8YrS3-Q2tpq2';
		}

		if(typeof editor.config.scayt_srcUrl !== 'string') {
			var protocol = document.location.protocol;
			protocol = protocol.search(/https?:/) != -1 ? protocol : 'http:';

			editor.config.scayt_srcUrl = protocol + '//svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/ckscayt.js';
		}

		if(typeof CKEDITOR.config.scayt_handleCheckDirty !== 'boolean') {
			CKEDITOR.config.scayt_handleCheckDirty = true;
		}

		if(typeof CKEDITOR.config.scayt_handleUndoRedo !== 'boolean') {
			CKEDITOR.config.scayt_handleUndoRedo = true;
		}

		if( editor.config.scayt_disableOptionsStorage ) {
			var userOptions = CKEDITOR.tools.isArray( editor.config.scayt_disableOptionsStorage ) ? editor.config.scayt_disableOptionsStorage : ( typeof editor.config.scayt_disableOptionsStorage === 'string' ) ? [ editor.config.scayt_disableOptionsStorage ] : undefined,
				availableValue = [ 'all', 'options', 'lang', 'ignore-all-caps-words', 'ignore-domain-names', 'ignore-words-with-mixed-cases', 'ignore-words-with-numbers'],
				valuesOption = ['lang', 'ignore-all-caps-words', 'ignore-domain-names', 'ignore-words-with-mixed-cases', 'ignore-words-with-numbers'],
				search = function ( array, value ) {
					var index = CKEDITOR.tools.indexOf( array, value );
					return index >= 0 ? array[ index ] : null;
				},
				indexOf = CKEDITOR.tools.indexOf;

			var isValidOption = function( option ) {
				return !!search( availableValue, option );
			};

			var makeOptionsToStorage = function( options ) {
				var retval = [];

				for (var i = 0; i < options.length; i++) {
					var value = options[i],
						isGroupOptionInUserOptions = !!search( options, 'options' );

					if( !isValidOption( value ) || isGroupOptionInUserOptions && !!search( valuesOption, function( val ) { if( val === 'lang' ) { return false; } } ) ) {
						return;
					}

					if( !!search( valuesOption, value ) ) {
						valuesOption.splice( indexOf( valuesOption, value ), 1 );
					}

					if(  value === 'all' || isGroupOptionInUserOptions && !!search( options, 'lang' )) {
						return [];
					}

					if( value === 'options' ) {
						valuesOption = [ 'lang' ];
					}
				}

				retval = retval.concat( valuesOption );

				return retval;
			};

			editor.config.scayt_disableOptionsStorage = makeOptionsToStorage( userOptions );
		}
	},
	addRule: function(editor) {
		var dataProcessor = editor.dataProcessor,
			htmlFilter = dataProcessor && dataProcessor.htmlFilter,
			pathFilters = editor._.elementsPath && editor._.elementsPath.filters,
			dataFilter = dataProcessor && dataProcessor.dataFilter,
			removeFormatFilter = editor.addRemoveFormatFilter,

			scaytFilter = function scaytFilter(element) {
				var plugin = CKEDITOR.plugins.scayt,
					scaytInstance = editor.scayt;

				if(scaytInstance && element.hasAttribute(plugin.options.data_attribute_name)) {
					return false;
				}
			},

			removeFormatFilterTemplate = function(element) {
				var plugin = CKEDITOR.plugins.scayt,
					scaytInstance = editor.scayt,
					result = true;

				if(scaytInstance && element.hasAttribute(plugin.options.data_attribute_name) || element.hasAttribute('_jquid')) {
					result = false;
				}

				return result;
			};

		if(pathFilters) {
			pathFilters.push(scaytFilter);
		}

		if(dataFilter) {
			var dataFilterRules = {
				elements: {
					span: function(element) {
						var plugin = CKEDITOR.plugins.scayt;

						if(element.attributes[plugin.options.data_attribute_name]) {
							delete element.name;
						}

						return element;
					}
				}
			};

			dataFilter.addRules(dataFilterRules);
		}

		if (htmlFilter) {
			var htmlFilterRules = {
				elements: {
					span: function(element) {
						var plugin = CKEDITOR.plugins.scayt;

						if(plugin && plugin.state[editor.name] && plugin.checkSubstringInString(plugin.options.misspelled_word_class, element.attributes['class']) && element.attributes[plugin.options.data_attribute_name]) {
							element.attributes['class'] = plugin.removeSubstringInString(plugin.options.misspelled_word_class, element.attributes['class']);
							delete element.attributes[plugin.options.data_attribute_name];
							delete element.name;
						}

						return element;
					}
				}
			};

			htmlFilter.addRules(htmlFilterRules);
		}

		if(removeFormatFilter) {
			removeFormatFilter.call(editor, removeFormatFilterTemplate);
		}
	},
	scaytMenuDefinition: function(editor) {
		var self = this,
			plugin = CKEDITOR.plugins.scayt;

		return {
			scayt_ignore: {
				label: 	editor.lang.scayt.ignore,
				group : 'scayt_control',
				order : 1,
				exec: function(editor) {
					var scaytInstance = editor.scayt;
					scaytInstance.ignoreWord();
				}
			},
			scayt_ignoreall: {
				label : editor.lang.scayt.ignoreAll,
				group : 'scayt_control',
				order : 2,
				exec: function(editor) {
					var scaytInstance = editor.scayt;
					scaytInstance.ignoreAllWords();
				}
			},
			scayt_add: {
				label : editor.lang.scayt.addWord,
				group : 'scayt_control',
				order : 3,
				exec : function(editor) {
					var scaytInstance = editor.scayt;
					// @TODO: We need to add set/restore bookmark logic to 'addWordToUserDictionary' method inside dictionarymanager.
					// Timeout is used as tmp fix for IE9, when after hitting 'Add word' menu item, document container fas blurred.
					setTimeout(function() {
						scaytInstance.addWordToUserDictionary();
					}, 10);
				}
			},
			option:{
				label : editor.lang.scayt.options,
				group : 'scayt_control',
				order : 4,
				exec: function(editor) {
					var scaytInstance = editor.scayt;

					scaytInstance.tabToOpen = 'options';
					editor.openDialog(self.dialogName);
				},
				verification: function(editor) {
					return (editor.config.scayt_uiTabs[0] == 1) ? true : false;
				}
			},
			language: {
				label : editor.lang.scayt.languagesTab,
				group : 'scayt_control',
				order : 5,
				exec: function(editor) {
					var scaytInstance = editor.scayt;

					scaytInstance.tabToOpen = 'langs';
					editor.openDialog(self.dialogName);
				},
				verification: function(editor) {
					return (editor.config.scayt_uiTabs[1] == 1) ? true : false;
				}
			},
			dictionary: {
				label : editor.lang.scayt.dictionariesTab,
				group : 'scayt_control',
				order : 6,
				exec: function(editor) {
					var scaytInstance = editor.scayt;

					scaytInstance.tabToOpen = 'dictionaries';
					editor.openDialog(self.dialogName);
				},
				verification: function(editor) {
					return (editor.config.scayt_uiTabs[2] == 1) ? true : false;
				}
			},
			about: {
				label : editor.lang.scayt.aboutTab,
				group : 'scayt_control',
				order : 7,
				exec: function(editor) {
					var scaytInstance = editor.scayt;

					scaytInstance.tabToOpen = 'about';
					editor.openDialog(self.dialogName);
				}
			}
		};
	},
	buildSuggestionMenuItems: function(editor, suggestions) {
		var self = this,
			itemList = {},
			subItemList = {},
			plugin = CKEDITOR.plugins.scayt;

		if(suggestions.length > 0 && suggestions[0] !== 'no_any_suggestions') {
			for(var i = 0; i < suggestions.length; i++) {

				var commandName = 'scayt_suggest_' + plugin.suggestions[i].replace(' ', '_');
				editor.addCommand(commandName, self.createCommand(plugin.suggestions[i]));

				if(i < editor.config.scayt_maxSuggestions) {

					/* mainSuggestions */
					editor.addMenuItem(commandName, {
						label: suggestions[i],
						command: commandName,
						group: 'scayt_suggest',
						order: i + 1
					});

					itemList[commandName] = CKEDITOR.TRISTATE_OFF;

				} else {

					//moreSuggestions
					editor.addMenuItem(commandName, {
						label: suggestions[i],
						command: commandName,
						group: 'scayt_moresuggest',
						order: i + 1
					});

					subItemList[commandName] = CKEDITOR.TRISTATE_OFF;

					if(editor.config.scayt_moreSuggestions === 'on') {

						editor.addMenuItem('scayt_moresuggest', {
							label : editor.lang.scayt.moreSuggestions,
							group : 'scayt_moresuggest',
							order : 10,
							getItems : function() {
								return subItemList;
							}
						});

						itemList['scayt_moresuggest'] = CKEDITOR.TRISTATE_OFF;
					}
				}
			}
		} else {
			var noSuggestionsCommand = 'no_scayt_suggest';
			itemList[noSuggestionsCommand] = CKEDITOR.TRISTATE_DISABLED;

			editor.addCommand(noSuggestionsCommand, {
				exec: function() {

				}
			});

			editor.addMenuItem(noSuggestionsCommand, {
				label : editor.lang.scayt['noSuggestions'] || noSuggestionsCommand,
				command: noSuggestionsCommand,
				group : 'scayt_suggest',
				order : 0
			});
		}

		return itemList;
	},
	menuGenerator: function(editor, word) {
		var self = this,
			scaytInstance = editor.scayt,
			menuItem = this.scaytMenuDefinition(editor),
			itemList = {},
			mainSuggestions = {},
			moreSuggestions = {},
			allowedOption = editor.config.scayt_contextCommands.split('|');

		scaytInstance.fire('getSuggestionsList', {lang: scaytInstance.getLang(), word: word});
		itemList = this.buildSuggestionMenuItems(editor, CKEDITOR.plugins.scayt.suggestions);

		if(editor.config.scayt_contextCommands == 'off') {
			return itemList;
		}

		for(var key in menuItem) {
			if(CKEDITOR.tools.indexOf(allowedOption, key.replace('scayt_', '')) == -1 && editor.config.scayt_contextCommands != 'all') {
				continue;
			}

			itemList[key] = CKEDITOR.TRISTATE_OFF;
			// delete item from context menu if its state isn't verified as allowed
			if(typeof menuItem[key].verification === 'function' && !menuItem[key].verification(editor)) {
				delete itemList[key];
			}

			editor.addCommand(key, {
				exec: menuItem[key].exec
			});

			editor.addMenuItem(key, {
				label : editor.lang.scayt[menuItem[key].label] || menuItem[key].label,
				command: key,
				group : menuItem[key].group,
				order : menuItem[key].order
			});
		}

		return itemList;
	},
	createCommand: function(suggestion) {
		return {
			exec: function(editor) {
				var scaytInstance = editor.scayt;
				scaytInstance.replaceSelectionNode({word: suggestion});
			}
		};
	}
});

CKEDITOR.plugins.scayt = {
	state: {},
	suggestions: [],
	loadingHelper: {
		loadOrder: []
	},
	warningCounter: 0,
	isLoading: false,
	options: {
		disablingCommandExec: {
			source: true,
			newpage: true,
			templates: true
		},
		data_attribute_name: 'data-scayt-word',
		misspelled_word_class: 'scayt-misspell-word'
	},
	backCompatibilityMap: {
		'scayt_service_protocol': 'scayt_serviceProtocol',
		'scayt_service_host'	: 'scayt_serviceHost',
		'scayt_service_port'	: 'scayt_servicePort',
		'scayt_service_path'	: 'scayt_servicePath',
		'scayt_customerid'		: 'scayt_customerId'
	},
	// backward compatibility if version of scayt app < 4.8.3
	reloadMarkup: function(scaytInstance) {
		if(scaytInstance){
			if(scaytInstance.reloadMarkup) {
				scaytInstance.reloadMarkup();
			} else {
				if(this.warningCounter < 5){
					console.warn('Note: You are using latest version of SCAYT plug-in. It is recommended to upgrade WebSpellChecker.net application to version v4.8.3.' +
							'Contact us by e-mail at support@webspellchecker.net.');
					this.warningCounter += 1;
				}
				scaytInstance.fire('startSpellCheck');
			}
		}
	},
	replaceOldOptionsNames: function(config) {
		for(var key in config) {
			if(key in this.backCompatibilityMap) {
				config[this.backCompatibilityMap[key]] = config[key];
				delete config[key];
			}
		}
	},
	checkSubstringInString: function(className, classesString) {
		var classRegex = new RegExp('(^|\\s)' + className + '(\\s|$)');

		return classRegex.test(classesString);
	},
	removeSubstringInString: function(className, classesString) {
		var result = classesString,
			classRegex = new RegExp('(^|\\s)' + className + '(\\s|$)');

		result = result.replace(classRegex, ' ').replace(/\s+$/, '');
		return result;
	},
	createScayt: function(editor) {
		var self = this;

		this.loadScaytLibrary(editor, function(_editor) {
			var _scaytInstanceOptions = {
				lang 				: _editor.config.scayt_sLang,
				container 			: _editor.document.getWindow().$.frameElement,
				customDictionary	: _editor.config.scayt_customDictionaryIds,
				userDictionaryName 	: _editor.config.scayt_userDictionaryName,
				localization		: _editor.langCode,
				customer_id			: _editor.config.scayt_customerId,
				data_attribute_name : self.options.data_attribute_name,
				misspelled_word_class: self.options.misspelled_word_class,
				ignoreElementsRegex : _editor.config.scayt_elementsToIgnore,
				minWordLength 		: _editor.config.scayt_minWordLength,
				'options-to-restore':  _editor.config.scayt_disableOptionsStorage
			};

			if(_editor.config.scayt_serviceProtocol) {
				_scaytInstanceOptions['service_protocol'] = _editor.config.scayt_serviceProtocol;
			}

			if(_editor.config.scayt_serviceHost) {
				_scaytInstanceOptions['service_host'] = _editor.config.scayt_serviceHost;
			}

			if(_editor.config.scayt_servicePort) {
				_scaytInstanceOptions['service_port'] = _editor.config.scayt_servicePort;
			}

			if(_editor.config.scayt_servicePath) {
				_scaytInstanceOptions['service_path'] = _editor.config.scayt_servicePath;
			}

			var _scaytInstance = new SCAYT.CKSCAYT(_scaytInstanceOptions, function() {
					// success callback
				}, function() {
					// error callback
				}),
				wordsPrefix = 'word_';

			_scaytInstance.subscribe('suggestionListSend', function(data) {
				// TODO: 1. Maybe store suggestions for specific editor
				// TODO: 2. Fix issue with suggestion duplicates on on server
				//CKEDITOR.plugins.scayt.suggestions = data.suggestionList;
				var _wordsCollection = {},
					_suggestionList = [];

				for (var i = 0; i < data.suggestionList.length; i++) {
					if (!_wordsCollection[wordsPrefix + data.suggestionList[i]]) {
						_wordsCollection[wordsPrefix + data.suggestionList[i]] = data.suggestionList[i];
						_suggestionList.push(data.suggestionList[i]);
					}
				}

				CKEDITOR.plugins.scayt.suggestions = _suggestionList;
			});

			_editor.scayt = _scaytInstance;

			_editor.fire('scaytButtonState', _editor.readOnly ? CKEDITOR.TRISTATE_DISABLED : CKEDITOR.TRISTATE_ON);
		});
	},
	destroy: function(editor) {
		var self = this,
			scaytInstance = editor.scayt;

		if(scaytInstance) {
			scaytInstance.destroy();
		}

		delete editor.scayt;
		editor.fire('scaytButtonState', CKEDITOR.TRISTATE_OFF);
	},
	loadScaytLibrary: function(editor, callback) {
		var self = this,
			date,
			timestamp,
			scaytUrl;

		if(typeof window.SCAYT === 'undefined' || typeof window.SCAYT.CKSCAYT !== 'function') {
			// add onLoad callbacks for editors while SCAYT is loading
			this.loadingHelper[editor.name] = callback;
			this.loadingHelper.loadOrder.push(editor.name);

			//creating unique timestamp for SCAYT URL
			date = new Date();
			timestamp = date.getTime();
			scaytUrl = editor.config.scayt_srcUrl + "?" + timestamp;

			CKEDITOR.scriptLoader.load(scaytUrl, function(success) {
				var editorName;

				CKEDITOR.fireOnce('scaytReady');

				for(var i = 0; i < self.loadingHelper.loadOrder.length; i++) {
					editorName = self.loadingHelper.loadOrder[i];

					if(typeof self.loadingHelper[editorName] === 'function') {
						self.loadingHelper[editorName](CKEDITOR.instances[editorName]);
					}

					delete self.loadingHelper[editorName];
				}
				self.loadingHelper.loadOrder = [];
			});
		} else if(window.SCAYT && typeof window.SCAYT.CKSCAYT === 'function') {
			CKEDITOR.fireOnce('scaytReady');

			if(!editor.scayt) {
				if(typeof callback === 'function') {
					callback(editor);
				}
			}
		}
	}
};

CKEDITOR.on('dialogDefinition', function(dialogDefinitionEvent) {
	var dialogName = dialogDefinitionEvent.data.name,
		dialogDefinition = dialogDefinitionEvent.data.definition,
		dialog = dialogDefinition.dialog;

	if (dialogName === 'scaytDialog') {
		dialog.on('cancel', function(cancelEvent) {
			return false;
		}, this, null, -1);
	}

	if (dialogName === 'link') {
		dialog.on('ok', function(okEvent) {
			var editor = okEvent.sender && okEvent.sender.getParentEditor();

			if(editor) {
				setTimeout(function() {
					editor.fire('reloadMarkupScayt', {
						removeOptions: {
							removeInside: true,
							forceBookmark: true
						},
						timeout: 0
					});
				}, 0);
			}
		});
	}
});

CKEDITOR.on('scaytReady', function() {
	// Override editor.checkDirty method avoid CK checkDirty functionality to fix SCAYT issues with incorrect checkDirty behavior.
	if(CKEDITOR.config.scayt_handleCheckDirty === true) {
		var editorCheckDirty = CKEDITOR.editor.prototype;

		editorCheckDirty.checkDirty = CKEDITOR.tools.override(editorCheckDirty.checkDirty, function(org) {
			return function() {
				var retval = null,
					plugin = CKEDITOR.plugins.scayt,
					scaytInstance = this.scayt,
					pluginState = plugin && plugin.state[this.name] && scaytInstance;

				if(!pluginState) {
					retval = org.apply(this);
				} else {
					var currentData = scaytInstance.removeMarkupFromString(this.getSnapshot());//.replace(/&nbsp;/g, ' ');
					var prevData = scaytInstance.removeMarkupFromString(this._.previousValue);//.replace(/&nbsp;/g, ' ');

					retval = (this.mayBeDirty && currentData !== prevData);
				}
				return retval;
			};
		});
	}

	if(CKEDITOR.config.scayt_handleUndoRedo === true) {
		var undoImagePrototype = CKEDITOR.plugins.undo.Image.prototype;

		undoImagePrototype.equals = CKEDITOR.tools.override(undoImagePrototype.equals, function(org) {
			return function(otherImage) {
				var plugin = CKEDITOR.plugins.scayt,
					scaytInstance = this.editor.scayt,
					thisContents = this.contents,
					otherContents = otherImage.contents;

				// Making the comparison based on content without SCAYT word markers.
				if(scaytInstance) {
					// scayt::reset might return value undefined. (#5742)
					this.contents = scaytInstance.removeMarkupFromString(thisContents) || '';
					otherImage.contents = scaytInstance.removeMarkupFromString(otherContents) || '';
				}
				//console.log(arguments);
				var retval = org.apply(this, arguments);

				this.contents = thisContents;
				otherImage.contents = otherContents;

				return retval;
			};
		});
	}
});