cmake_minimum_required(VERSION 2.6)

project(ckeditor)

set(CKEDITOR_BUILD_DIR ${CMAKE_CURRENT_BINARY_DIR}/release)

if (WIN32)
	configure_file(release.bat.in ${CMAKE_CURRENT_BINARY_DIR}/release.bat)
	configure_file(langtool.bat.in ${CMAKE_CURRENT_BINARY_DIR}/langtool.bat)
	set(BUILD_COMMAND call ${CMAKE_CURRENT_BINARY_DIR}/release.bat > ${CMAKE_CURRENT_BINARY_DIR}/ckeditor_build_log.txt)

	add_custom_command(
		OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/ckeditor.build
		COMMAND ${BUILD_COMMAND}
		COMMAND ${CMAKE_COMMAND} -E echo "ckeditor build tag" > ${CMAKE_CURRENT_BINARY_DIR}/ckeditor.build
		WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/_dev/releaser
		DEPENDS .
	)

else (WIN32)

	configure_file(release.sh.in ${CMAKE_CURRENT_BINARY_DIR}/release.sh)
	configure_file(langtool.sh.in ${CMAKE_CURRENT_BINARY_DIR}/langtool.sh)
	set(BUILD_COMMAND "${CMAKE_CURRENT_BINARY_DIR}/release.sh")

	add_custom_command(
		OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/ckeditor.build
		COMMAND chmod 777 ${CMAKE_CURRENT_BINARY_DIR}/release.sh
		COMMAND chmod 777 ${CMAKE_CURRENT_BINARY_DIR}/langtool.sh
		COMMAND ${BUILD_COMMAND}
		COMMAND ${CMAKE_COMMAND} -E echo "ckeditor build tag" > ${CMAKE_CURRENT_BINARY_DIR}/ckeditor.build
		WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/_dev/releaser
		DEPENDS .
	)
endif (WIN32)


add_custom_target(ckeditor ALL DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/ckeditor.build)

install(
	DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/release/release/
	DESTINATION WebComponents/samples/editors/ckeditor
	PATTERN "_samples" EXCLUDE
	PATTERN "_source" EXCLUDE
	PATTERN ".git*" EXCLUDE
	PATTERN "CMakeLists.txt" EXCLUDE
	PATTERN "*.in" EXCLUDE # all langtool.*.in and release.*.in
)
