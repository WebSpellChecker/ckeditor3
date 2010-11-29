@ECHO OFF
::
:: Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
:: For licensing, see LICENSE.html or http://ckeditor.com/license
::

adt -package -storetype pkcs12 -keystore cert.pfx -storepass 123abc CKEditor.air application.xml -C ../../ .
