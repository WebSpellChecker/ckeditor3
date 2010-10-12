
This contains a sample Firefox extension that opens CKEditor in a dialog with the context-menu of textareas.


-====================-
Install instructions:
---------------------
Usually a Firefox extension is deployed as a XPI (== .zip but just renamed), although for development 
purposes it's easier to use the "proxy file" method

Take a look at https://developer.mozilla.org/en/Setting_up_extension_development_environment for general
recomendations about developing an extension for Firefox, and how to create a separate profile that doesn't
interfere with general browsing.
The point that it's important is https://developer.mozilla.org/en/Setting_up_extension_development_environment#Firefox_extension_proxy_file
Following those steps in inverse order:
1. Open the "extensions" folder in your profile (you can open about:support and it offers a button to open the profile 
folder)
2. Create a file named "mozeditor@cksource.com" (be careful with hidden extensions in windows)
3. Using a text editor, put the path to this folder (including the last slash). For example D:\CKSource\ff_extension\

Now launch Firefox again.
It's very important to notice that by default Firefox is agressive caching the contents of extensions, so it's important to use
preferences like
nglayout.debug.disable_xul_cache = true 
nglayout.debug.disable_xul_fastload = true (for FF4)
(you have to create them in about:config, context menu -> New -> Boolean)

If they are set correctly it's possible to edit the contents of the extension and when the dialog is launched again it can 
pick up the changes without reloading Firefox. A useful extension about this is https://addons.mozilla.org/en-US/firefox/addon/7434/ 
that provides an option to reload all the chrome.

The CKEditor folder under content\ points to the SVN trunk, it doesn't have anything special.
The editor.html file in content\ is loaded as an iframe in the dialog, and in fact it can be launched as a standalone page.

-====================-
Testing the extension:
----------------------
Open a page with a textarea, right click on it and you'll see an option to launch mozEditor, just select it and the dialog should launch
with CKEditor running with chrome priviledges