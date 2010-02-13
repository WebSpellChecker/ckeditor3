/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

/**
 * @fileOverview Defines the {@link CKEDITOR.lang} object, for the
 * Spanish language.
 */

/**#@+
   @type String
   @example
*/

/**
 * Constains the dictionary of language entries.
 * @namespace
 */
CKEDITOR.lang['es'] =
{
	/**
	 * The language reading direction. Possible values are "rtl" for
	 * Right-To-Left languages (like Arabic) and "ltr" for Left-To-Right
	 * languages (like English).
	 * @default 'ltr'
	 */
	dir : 'ltr',

	/*
	 * Screenreader titles. Please note that screenreaders are not always capable
	 * of reading non-English words. So be careful while translating it.
	 */
	editorTitle		: 'Rich text editor, %1, press ALT 0 for help.', // MISSING

	// Toolbar buttons without dialogs.
	source			: 'Fuente HTML',
	newPage			: 'Nueva Página',
	save			: 'Guardar',
	preview			: 'Vista Previa',
	cut				: 'Cortar',
	copy			: 'Copiar',
	paste			: 'Pegar',
	print			: 'Imprimir',
	underline		: 'Subrayado',
	bold			: 'Negrita',
	italic			: 'Cursiva',
	selectAll		: 'Seleccionar Todo',
	removeFormat	: 'Eliminar Formato',
	strike			: 'Tachado',
	subscript		: 'Subíndice',
	superscript		: 'Superíndice',
	horizontalrule	: 'Insertar Línea Horizontal',
	pagebreak		: 'Insertar Salto de Página',
	unlink			: 'Eliminar Vínculo',
	undo			: 'Deshacer',
	redo			: 'Rehacer',

	// Common messages and labels.
	common :
	{
		browseServer	: 'Ver Servidor',
		url				: 'URL',
		protocol		: 'Protocolo',
		upload			: 'Cargar',
		uploadSubmit	: 'Enviar al Servidor',
		image			: 'Imagen',
		flash			: 'Flash',
		form			: 'Formulario',
		checkbox		: 'Casilla de Verificación',
		radio		: 'Botones de Radio',
		textField		: 'Campo de Texto',
		textarea		: 'Area de Texto',
		hiddenField		: 'Campo Oculto',
		button			: 'Botón',
		select	: 'Campo de Selección',
		imageButton		: 'Botón Imagen',
		notSet			: '<No definido>',
		id				: 'Id',
		name			: 'Nombre',
		langDir			: 'Orientación',
		langDirLtr		: 'Izquierda a Derecha (LTR)',
		langDirRtl		: 'Derecha a Izquierda (RTL)',
		langCode		: 'Cód. de idioma',
		longDescr		: 'Descripción larga URL',
		cssClass		: 'Clases de hojas de estilo',
		advisoryTitle	: 'Título',
		cssStyle		: 'Estilo',
		ok				: 'Aceptar',
		cancel			: 'Cancelar',
		close : 'Close', // MISSING
		generalTab		: 'General',
		advancedTab		: 'Avanzado',
		validateNumberFailed	: 'El valor no es un número.',
		confirmNewPage	: 'Cualquier cambio que no se haya guardado se perderá. ¿Está seguro de querer crear una nueva página?',
		confirmCancel	: 'Algunas de las opciones se han cambiado. ¿Está seguro de querer cerrar el diálogo?',
		options : 'Options', // MISSING

		// Put the voice-only part of the label in the span.
		unavailable		: '%1<span class="cke_accessibility">, no disponible</span>'
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: 'Insertar Caracter Especial',
		title		: 'Seleccione un caracter especial'
	},

	// Link dialog.
	link :
	{
		toolbar		: 'Insertar/Editar Vínculo',
		menu		: 'Editar Vínculo',
		title		: 'Vínculo',
		info		: 'Información de Vínculo',
		target		: 'Destino',
		upload		: 'Cargar',
		advanced	: 'Avanzado',
		type		: 'Tipo de vínculo',
		toAnchor	: 'Referencia en esta página',
		toEmail		: 'E-Mail',
		target		: 'Destino',
		targetNotSet	: '<No definido>',
		targetFrame	: '<marco>',
		targetPopup	: '<ventana emergente>',
		targetNew	: 'Nueva Ventana(_blank)',
		targetTop	: 'Ventana primaria (_top)',
		targetSelf	: 'Misma Ventana (_self)',
		targetParent	: 'Ventana Padre (_parent)',
		targetFrameName	: 'Nombre del Marco Destino',
		targetPopupName	: 'Nombre de Ventana Emergente',
		popupFeatures	: 'Características de Ventana Emergente',
		popupResizable	: 'Redimensionable',
		popupStatusBar	: 'Barra de Estado',
		popupLocationBar	: 'Barra de ubicación',
		popupToolbar	: 'Barra de Herramientas',
		popupMenuBar	: 'Barra de Menú',
		popupFullScreen	: 'Pantalla Completa (IE)',
		popupScrollBars	: 'Barras de desplazamiento',
		popupDependent	: 'Dependiente (Netscape)',
		popupWidth		: 'Anchura',
		popupLeft		: 'Posición Izquierda',
		popupHeight		: 'Altura',
		popupTop		: 'Posición Derecha',
		id				: 'Id',
		langDir			: 'Orientación',
		langDirNotSet	: '<No definido>',
		langDirLTR		: 'Izquierda a Derecha (LTR)',
		langDirRTL		: 'Derecha a Izquierda (RTL)',
		acccessKey		: 'Clave de Acceso',
		name			: 'Nombre',
		langCode		: 'Código idioma',
		tabIndex		: 'Indice de tabulación',
		advisoryTitle	: 'Título',
		advisoryContentType	: 'Tipo de Contenido',
		cssClasses		: 'Clases de hojas de estilo',
		charset			: 'Fuente de caracteres vinculado',
		styles			: 'Estilo',
		selectAnchor	: 'Seleccionar una referencia',
		anchorName		: 'Por Nombre de Referencia',
		anchorId		: 'Por ID de elemento',
		emailAddress	: 'Dirección de E-Mail',
		emailSubject	: 'Título del Mensaje',
		emailBody		: 'Cuerpo del Mensaje',
		noAnchors		: '(No hay referencias disponibles en el documento)',
		noUrl			: 'Por favor tipee el vínculo URL',
		noEmail			: 'Por favor tipee la dirección de e-mail'
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: 'Referencia',
		menu		: 'Propiedades de Referencia',
		title		: 'Propiedades de Referencia',
		name		: 'Nombre de la Referencia',
		errorName	: 'Por favor, complete el nombre de la Referencia'
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: 'Buscar y Reemplazar',
		find				: 'Buscar',
		replace				: 'Reemplazar',
		findWhat			: 'Texto a buscar:',
		replaceWith			: 'Reemplazar con:',
		notFoundMsg			: 'El texto especificado no ha sido encontrado.',
		matchCase			: 'Coincidir may/min',
		matchWord			: 'Coincidir toda la palabra',
		matchCyclic			: 'Buscar en todo el contenido',
		replaceAll			: 'Reemplazar Todo',
		replaceSuccessMsg	: 'La expresión buscada ha sido reemplazada %1 veces.'
	},

	// Table Dialog
	table :
	{
		toolbar		: 'Tabla',
		title		: 'Propiedades de Tabla',
		menu		: 'Propiedades de Tabla',
		deleteTable	: 'Eliminar Tabla',
		rows		: 'Filas',
		columns		: 'Columnas',
		border		: 'Tamaño de Borde',
		align		: 'Alineación',
		alignNotSet	: '<No establecido>',
		alignLeft	: 'Izquierda',
		alignCenter	: 'Centrado',
		alignRight	: 'Derecha',
		width		: 'Anchura',
		widthPx		: 'pixeles',
		widthPc		: 'porcentaje',
		widthUnit	: 'width unit', // MISSING
		height		: 'Altura',
		cellSpace	: 'Esp. e/celdas',
		cellPad		: 'Esp. interior',
		caption		: 'Título',
		summary		: 'Síntesis',
		headers		: 'Encabezados',
		headersNone		: 'Ninguno',
		headersColumn	: 'Primera columna',
		headersRow		: 'Primera fila',
		headersBoth		: 'Ambas',
		invalidRows		: 'El número de filas debe ser un número mayor que 0.',
		invalidCols		: 'El número de columnas debe ser un número mayor que 0.',
		invalidBorder	: 'El tamaño del borde debe ser un número.',
		invalidWidth	: 'La anchura de tabla debe ser un número.',
		invalidHeight	: 'La altura de tabla debe ser un número.',
		invalidCellSpacing	: 'El espaciado entre celdas debe ser un número.',
		invalidCellPadding	: 'El espaciado interior debe ser un número.',

		cell :
		{
			menu			: 'Celda',
			insertBefore	: 'Insertar celda a la izquierda',
			insertAfter		: 'Insertar celda a la derecha',
			deleteCell		: 'Eliminar Celdas',
			merge			: 'Combinar Celdas',
			mergeRight		: 'Combinar a la derecha',
			mergeDown		: 'Combinar hacia abajo',
			splitHorizontal	: 'Dividir la celda horizontalmente',
			splitVertical	: 'Dividir la celda verticalmente',
			title			: 'Propiedades de celda',
			cellType		: 'Tipo de Celda',
			rowSpan			: 'Expandir filas',
			colSpan			: 'Expandir columnas',
			wordWrap		: 'Ajustar al contenido',
			hAlign			: 'Alineación Horizontal',
			vAlign			: 'Alineación Vertical',
			alignTop		: 'Arriba',
			alignMiddle		: 'Medio',
			alignBottom		: 'Abajo',
			alignBaseline	: 'Linea de base',
			bgColor			: 'Color de fondo',
			borderColor		: 'Color de borde',
			data			: 'Datos',
			header			: 'Encabezado',
			yes				: 'Sí',
			no				: 'No',
			invalidWidth	: 'La anchura de celda debe ser un número.',
			invalidHeight	: 'La altura de celda debe ser un número.',
			invalidRowSpan	: 'La expansión de filas debe ser un número entero.',
			invalidColSpan	: 'La expansión de columnas debe ser un número entero.',
			chooseColor : 'Elegir'
		},

		row :
		{
			menu			: 'Fila',
			insertBefore	: 'Insertar fila en la parte superior',
			insertAfter		: 'Insertar fila en la parte inferior',
			deleteRow		: 'Eliminar Filas'
		},

		column :
		{
			menu			: 'Columna',
			insertBefore	: 'Insertar columna a la izquierda',
			insertAfter		: 'Insertar columna a la derecha',
			deleteColumn	: 'Eliminar Columnas'
		}
	},

	// Button Dialog.
	button :
	{
		title		: 'Propiedades de Botón',
		text		: 'Texto (Valor)',
		type		: 'Tipo',
		typeBtn		: 'Boton',
		typeSbm		: 'Enviar',
		typeRst		: 'Reestablecer'
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : 'Propiedades de Casilla',
		radioTitle	: 'Propiedades de Botón de Radio',
		value		: 'Valor',
		selected	: 'Seleccionado'
	},

	// Form Dialog.
	form :
	{
		title		: 'Propiedades de Formulario',
		menu		: 'Propiedades de Formulario',
		action		: 'Acción',
		method		: 'Método',
		encoding	: 'Codificación',
		target		: 'Destino',
		targetNotSet	: '<No definido>',
		targetNew	: 'Nueva Ventana(_blank)',
		targetTop	: 'Ventana primaria (_top)',
		targetSelf	: 'Misma Ventana (_self)',
		targetParent	: 'Ventana Padre (_parent)'
	},

	// Select Field Dialog.
	select :
	{
		title		: 'Propiedades de Campo de Selección',
		selectInfo	: 'Información',
		opAvail		: 'Opciones disponibles',
		value		: 'Valor',
		size		: 'Tamaño',
		lines		: 'Lineas',
		chkMulti	: 'Permitir múltiple selección',
		opText		: 'Texto',
		opValue		: 'Valor',
		btnAdd		: 'Agregar',
		btnModify	: 'Modificar',
		btnUp		: 'Subir',
		btnDown		: 'Bajar',
		btnSetValue : 'Establecer como predeterminado',
		btnDelete	: 'Eliminar'
	},

	// Textarea Dialog.
	textarea :
	{
		title		: 'Propiedades de Area de Texto',
		cols		: 'Columnas',
		rows		: 'Filas'
	},

	// Text Field Dialog.
	textfield :
	{
		title		: 'Propiedades de Campo de Texto',
		name		: 'Nombre',
		value		: 'Valor',
		charWidth	: 'Caracteres de ancho',
		maxChars	: 'Máximo caracteres',
		type		: 'Tipo',
		typeText	: 'Texto',
		typePass	: 'Contraseña'
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: 'Propiedades de Campo Oculto',
		name	: 'Nombre',
		value	: 'Valor'
	},

	// Image Dialog.
	image :
	{
		title		: 'Propiedades de Imagen',
		titleButton	: 'Propiedades de Botón de Imagen',
		menu		: 'Propiedades de Imagen',
		infoTab	: 'Información de Imagen',
		btnUpload	: 'Enviar al Servidor',
		url		: 'URL',
		upload	: 'Cargar',
		alt		: 'Texto Alternativo',
		width		: 'Anchura',
		height	: 'Altura',
		lockRatio	: 'Proporcional',
		unlockRatio	: 'Unlock Ratio', // MISSING
		resetSize	: 'Tamaño Original',
		border	: 'Borde',
		hSpace	: 'Esp.Horiz',
		vSpace	: 'Esp.Vert',
		align		: 'Alineación',
		alignLeft	: 'Izquierda',
		alignRight	: 'Derecha',
		preview	: 'Vista Previa',
		alertUrl	: 'Por favor escriba la URL de la imagen',
		linkTab	: 'Vínculo',
		button2Img	: '¿Desea convertir el botón de imagen en una simple imagen?',
		img2Button	: '¿Desea convertir la imagen en un botón de imagen?',
		urlMissing : 'Debe indicar la URL de la imagen.',
		validateWidth : 'Width must be a whole number.', // MISSING
		validateHeight : 'Height must be a whole number.', // MISSING
		validateBorder : 'Border must be a whole number.', // MISSING
		validateHSpace : 'HSpace must be a whole number.', // MISSING
		validateVSpace : 'VSpace must be a whole number.' // MISSING
	},

	// Flash Dialog
	flash :
	{
		properties		: 'Propiedades de Flash',
		propertiesTab	: 'Propiedades',
		title		: 'Propiedades de Flash',
		chkPlay		: 'Autoejecución',
		chkLoop		: 'Repetir',
		chkMenu		: 'Activar Menú Flash',
		chkFull		: 'Permitir pantalla completa',
 		scale		: 'Escala',
		scaleAll		: 'Mostrar todo',
		scaleNoBorder	: 'Sin Borde',
		scaleFit		: 'Ajustado',
		access			: 'Acceso de scripts',
		accessAlways	: 'Siempre',
		accessSameDomain	: 'Mismo dominio',
		accessNever	: 'Nunca',
		align		: 'Alineación',
		alignLeft	: 'Izquierda',
		alignAbsBottom: 'Abs inferior',
		alignAbsMiddle: 'Abs centro',
		alignBaseline	: 'Línea de base',
		alignBottom	: 'Pie',
		alignMiddle	: 'Centro',
		alignRight	: 'Derecha',
		alignTextTop	: 'Tope del texto',
		alignTop	: 'Tope',
		quality		: 'Calidad',
		qualityBest		 : 'La mejor',
		qualityHigh		 : 'Alta',
		qualityAutoHigh	 : 'Auto Alta',
		qualityMedium	 : 'Media',
		qualityAutoLow	 : 'Auto Baja',
		qualityLow		 : 'Baja',
		windowModeWindow	 : 'Ventana',
		windowModeOpaque	 : 'Opaco',
		windowModeTransparent	 : 'Transparente',
		windowMode	: 'WindowMode',
		flashvars	: 'Opciones',
		bgcolor	: 'Color de Fondo',
		width	: 'Anchura',
		height	: 'Altura',
		hSpace	: 'Esp.Horiz',
		vSpace	: 'Esp.Vert',
		validateSrc : 'Por favor escriba el vínculo URL',
		validateWidth : 'Anchura debe ser un número.',
		validateHeight : 'Altura debe ser un número.',
		validateHSpace : 'Esp.Horiz debe ser un número.',
		validateVSpace : 'Esp.Vert debe ser un número.'
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: 'Ortografía',
		title			: 'Comprobar ortografía',
		notAvailable	: 'Lo sentimos pero el servicio no está disponible.',
		errorLoading	: 'Error cargando la aplicación del servidor: %s.',
		notInDic		: 'No se encuentra en el Diccionario',
		changeTo		: 'Cambiar a',
		btnIgnore		: 'Ignorar',
		btnIgnoreAll	: 'Ignorar Todo',
		btnReplace		: 'Reemplazar',
		btnReplaceAll	: 'Reemplazar Todo',
		btnUndo			: 'Deshacer',
		noSuggestions	: '- No hay sugerencias -',
		progress		: 'Control de Ortografía en progreso...',
		noMispell		: 'Control finalizado: no se encontraron errores',
		noChanges		: 'Control finalizado: no se ha cambiado ninguna palabra',
		oneChange		: 'Control finalizado: se ha cambiado una palabra',
		manyChanges		: 'Control finalizado: se ha cambiado %1 palabras',
		ieSpellDownload	: 'Módulo de Control de Ortografía no instalado. ¿Desea descargarlo ahora?'
	},

	smiley :
	{
		toolbar	: 'Emoticons',
		title	: 'Insertar un Emoticon'
	},

	elementsPath :
	{
		eleLabel : 'Elements path',  // MISSING
		eleTitle : '%1 elemento'
	},

	numberedlist : 'Numeración',
	bulletedlist : 'Viñetas',
	indent : 'Aumentar Sangría',
	outdent : 'Disminuir Sangría',

	justify :
	{
		left : 'Alinear a Izquierda',
		center : 'Centrar',
		right : 'Alinear a Derecha',
		block : 'Justificado'
	},

	blockquote : 'Cita',

	clipboard :
	{
		title		: 'Pegar',
		cutError	: 'La configuración de seguridad de este navegador no permite la ejecución automática de operaciones de cortado. Por favor use el teclado (Ctrl+X).',
		copyError	: 'La configuración de seguridad de este navegador no permite la ejecución automática de operaciones de copiado. Por favor use el teclado (Ctrl+C).',
		pasteMsg	: 'Por favor pegue dentro del cuadro utilizando el teclado (<STRONG>Ctrl+V</STRONG>); luego presione <STRONG>Aceptar</STRONG>.',
		securityMsg	: 'Debido a la configuración de seguridad de su navegador, el editor no tiene acceso al portapapeles. Es necesario que lo pegue de nuevo en esta ventana.',
		pasteArea	: 'Paste Area' // MISSING
	},

	pastefromword :
	{
		confirmCleanup : 'El texto que desea parece provenir de Word. Desea depurarlo antes de pegarlo?',
		toolbar : 'Pegar desde Word',
		title : 'Pegar desde Word',
		error : 'No ha sido posible limpiar los datos debido a un error interno'
	},

	pasteText :
	{
		button : 'Pegar como Texto Plano',
		title : 'Pegar como Texto Plano'
	},

	templates :
	{
		button : 'Plantillas',
		title : 'Contenido de Plantillas',
		insertOption: 'Reemplazar el contenido actual',
		selectPromptMsg: 'Por favor selecciona la plantilla a abrir en el editor<br>(el contenido actual se perderá):',
		emptyListMsg : '(No hay plantillas definidas)'
	},

	showBlocks : 'Mostrar bloques',

	stylesCombo :
	{
		label : 'Estilo',
		panelTitle : 'Formatting Styles', // MISSING
		panelTitle1 : 'Estilos de párrafo',
		panelTitle2 : 'Estilos de carácter',
		panelTitle3 : 'Estilos de objeto'
	},

	format :
	{
		label : 'Formato',
		panelTitle : 'Formato',

		tag_p : 'Normal',
		tag_pre : 'Con formato',
		tag_address : 'Dirección',
		tag_h1 : 'Encabezado 1',
		tag_h2 : 'Encabezado 2',
		tag_h3 : 'Encabezado 3',
		tag_h4 : 'Encabezado 4',
		tag_h5 : 'Encabezado 5',
		tag_h6 : 'Encabezado 6',
		tag_div : 'Normal (DIV)'
	},

	div :
	{
		title				: 'Crear contenedor DIV',
		toolbar				: 'Crear contenedor DIV',
		cssClassInputLabel	: 'Clase de hoja de estilos',
		styleSelectLabel	: 'Estilo',
		IdInputLabel		: 'Id',
		languageCodeInputLabel	: ' Codigo de idioma',
		inlineStyleInputLabel	: 'Estilo',
		advisoryTitleInputLabel	: 'Título',
		langDirLabel		: 'Orientación',
		langDirLTRLabel		: 'Izquierda a Derecha (LTR)',
		langDirRTLLabel		: 'Derecha a Izquierda (RTL)',
		edit				: 'Editar Div',
		remove				: 'Quitar Div'
  	},

	font :
	{
		label : 'Fuente',
		voiceLabel : 'Fuente',
		panelTitle : 'Fuente'
	},

	fontSize :
	{
		label : 'Tamaño',
		voiceLabel : 'Tamaño de fuente',
		panelTitle : 'Tamaño'
	},

	colorButton :
	{
		textColorTitle : 'Color de Texto',
		bgColorTitle : 'Color de Fondo',
		panelTitle : 'Colors', // MISSING
		auto : 'Automático',
		more : 'Más Colores...'
	},

	colors :
	{
		'000' : 'Negro',
		'800000' : 'Granate',
		'8B4513' : 'Saddle Brown', // MISSING
		'2F4F4F' : 'Pizarra Oscuro',
		'008080' : 'Azul verdoso',
		'000080' : 'Azul marino',
		'4B0082' : 'Añil',
		'696969' : 'Gris medio',
		'B22222' : 'Fire Brick', // MISSING
		'A52A2A' : 'Marrón',
		'DAA520' : 'Golden Rod', // MISSING
		'006400' : 'Verde oscuro',
		'40E0D0' : 'Turquesa',
		'0000CD' : 'Medium Blue', // MISSING
		'800080' : 'Púrpura',
		'808080' : 'Gris',
		'F00' : 'Rojo',
		'FF8C00' : 'Naranja oscuro',
		'FFD700' : 'Oro',
		'008000' : 'Verde',
		'0FF' : 'Cian',
		'00F' : 'Azul',
		'EE82EE' : 'Violeta',
		'A9A9A9' : 'Gris oscuro',
		'FFA07A' : 'Salmón claro',
		'FFA500' : 'Naranja',
		'FFFF00' : 'Amarillo',
		'00FF00' : 'Lima',
		'AFEEEE' : 'Turquesa claro',
		'ADD8E6' : 'Azul claro',
		'DDA0DD' : 'Ciruela',
		'D3D3D3' : 'Gris claro',
		'FFF0F5' : 'Lavender Blush', // MISSING
		'FAEBD7' : 'Blanco antiguo',
		'FFFFE0' : 'Amarillo claro',
		'F0FFF0' : 'Miel',
		'F0FFFF' : 'Azul celeste',
		'F0F8FF' : 'Alice Blue', // MISSING
		'E6E6FA' : 'LAvanda',
		'FFF' : 'Blanco'
	},

	scayt :
	{
		title : 'Comprobar Ortografía Mientras Escribe',
		enable : 'Activar Corrector',
		disable : 'Desactivar Corrector',
		about : 'Acerca de Corrector',
		toggle : 'Cambiar Corrector',
		options : 'Opciones',
		langs : 'Idiomas',
		moreSuggestions : 'Más sugerencias',
		ignore : 'Ignorar',
		ignoreAll : 'Ignorar Todas',
		addWord : 'Añadir palabra',
		emptyDic : 'El nombre del diccionario no puede estar en blanco.',
		optionsTab : 'Opciones',
		languagesTab : 'Idiomas',
		dictionariesTab : 'Diccionarios',
		aboutTab : 'Acerca de'
	},

	about :
	{
		title : 'Acerca de CKEditor',
		dlgTitle : 'Acerca de CKEditor',
		moreInfo : 'Para información de licencia, por favor visite nuestro sitio web:',
		copy : 'Copyright &copy; $1. Todos los derechos reservados.'
	},

	maximize : 'Maximizar',
	minimize : 'Minimizar',

	fakeobjects :
	{
		anchor : 'Ancla',
		flash : 'Animación flash',
		div : 'Salto de página',
		unknown : 'Objeto desconocido'
	},

	resize : 'Arrastre para redimensionar',

	colordialog :
	{
		title : 'Elegir color',
		highlight : 'Muestra',
		selected : 'Elegido',
		clear : 'Borrar'
	},

	toolbarCollapse : 'Contraer barra de herramientas',
	toolbarExpand : 'Expandir barra de herramientas'
};
