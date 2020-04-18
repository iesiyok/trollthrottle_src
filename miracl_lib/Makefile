back_compiler = gcc
front_compiler = emcc

all:
	@echo "type 'make front_compile' for compiling miracl static library for front-end and creating miracl_front.a file"
	@echo "type 'make back_compile' for compiling miracl static library for back-end and creating miracl_back.a file"
	@echo "type 'make front_library' for creating the DAA API daa_front.js and daa_front.wasm files"
	@echo "type 'make back_so' for creating the DAA API daa_back.so file for linux environments"
	@echo "type 'make back_dylib' for creating the DAA API daa_back.dylib file for mac environment"

front_compile:
	cd mr_files ;\
	cp front_mirdef.h mirdef.h ;\
	cp front_mrmuldv.c mrmuldv.c ;\
	rm -f miracl_front.a ;\
	rm -f *.o ;\
	${front_compiler} -c -O2 -Wall mr*.c ;\
	llvm-ar rc miracl_front.a *.o ;\
	rm -f *.o ;\
	echo "Static library for front-end has been created." ;\
	cd .. ;

back_compile:
	cd mr_files ;\
	cp back_mirdef.h mirdef.h ;\
	cp back_mrmuldv.c mrmuldv.c ;\
	rm -f miracl_back.a ;\
	${back_compiler} -c -O2 -Wall mr*.c ;\
	ar rc miracl_back.a *.o ;
	rm -f *.o ;\
	echo "Static library for back-end has been created." ;\
	cd .. ;


front_library:
	cp front_mirdef mirdef.h ;\
	${front_compiler} -c -O2 -std=c++14 bn_pair.cpp -o bn_pair.bc ; \
    ${front_compiler} -c -O2 -std=c++14 daa_front.cpp -o daa_front.bc ; \
    ${front_compiler} -c -O2 -std=c++14 big.cpp -o big.bc ; \
    ${front_compiler} -c -O2 -std=c++14 ecn.cpp -o ecn.bc ; \
    ${front_compiler} -c -O2 -std=c++14 ecn2.cpp -o ecn2.bc ; \
    ${front_compiler} -c -O2 -std=c++14 zzn.cpp -o zzn.bc ; \
    ${front_compiler} -c -O2 -std=c++14 zzn2.cpp -o zzn2.bc ; \
    ${front_compiler} -c -O2 -std=c++14 zzn12a.cpp -o zzn12a.bc ; \
    ${front_compiler} -c -O2 -std=c++14 zzn4.cpp -o zzn4.bc ; \
    ${front_compiler} -O1 --bind -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -Wall daa_front.bc bn_pair.bc ecn.bc ecn2.bc zzn12a.bc big.bc zzn.bc zzn2.bc zzn4.bc mr_files/miracl_front.a -fvisibility=hidden -o daa_front.js ; \
	rm -f *.bc ; \
	echo "Shared library for front-end has been created." ;


back_dylib:
	rm -f daa_back.dylib ;\
	cp back_mirdef.h mirdef.h ;\
	g++ -c -O2 -m64 -fPIC -mdynamic-no-pic -std=c++14 bn_pair.cpp ; \
	g++ -c -O2 -m64 -fPIC -mdynamic-no-pic -std=c++14 daa_back.cpp ; \
	g++ -c -O2 -m64 -fPIC -mdynamic-no-pic -std=c++14 big.cpp ; \
	g++ -c -O2 -m64 -fPIC -mdynamic-no-pic -std=c++14 ecn.cpp ; \
	g++ -c -O2 -m64 -fPIC -mdynamic-no-pic -std=c++14 ecn2.cpp ; \
	g++ -c -O2 -m64 -fPIC -mdynamic-no-pic -std=c++14 zzn.cpp ; \
	g++ -c -O2 -m64 -fPIC -mdynamic-no-pic -std=c++14 zzn2.cpp ; \
	g++ -c -O2 -m64 -fPIC -mdynamic-no-pic -std=c++14 zzn12a.cpp ; \
	g++ -c -O2 -m64 -fPIC -mdynamic-no-pic -std=c++14 zzn4.cpp ; \
	g++ -fPIC -m64 -Wall -dynamiclib daa_back.o bn_pair.o ecn.o ecn2.o zzn12a.o big.o zzn.o zzn2.o zzn4.o mr_files/miracl_back.a -current_version 1.0 -compatibility_version 1.0 -fvisibility=hidden -o daa_back.dylib ; \
	rm -f *.o ;\
	echo "Shared library (mac) for back-end has been created." ;

back_so:
	rm -f daa_back.so ;\
	cp back_mirdef.h mirdef.h ;\
	g++ -c -O2 -m64  -std=c++14 -fPIC bn_pair.cpp ;\
	g++ -c -O2 -m64  -std=c++14 -fPIC daa_back.cpp ;\
	g++ -c -O2 -m64  -std=c++14 -fPIC big.cpp ; \
	g++ -c -O2 -m64  -std=c++14 -fPIC ecn.cpp ; \
	g++ -c -O2 -m64  -std=c++14 -fPIC ecn2.cpp ; \
	g++ -c -O2 -m64  -std=c++14 -fPIC zzn.cpp ; \
	g++ -c -O2 -m64  -std=c++14 -fPIC zzn2.cpp ; \
	g++ -c -O2 -m64  -std=c++14 -fPIC zzn12a.cpp ; \
	g++ -c -O2 -m64  -std=c++14 -fPIC zzn4.cpp ; \
	g++ -o daa_back.so -shared -g -Wall daa_back.o bn_pair.o ecn.o ecn2.o zzn12a.o big.o zzn.o zzn2.o zzn4.o mr_files/miracl_back.a ; \
	rm -f *.o ;\
	echo "Shared library (linux) for back-end has been created." ;
