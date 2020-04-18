/*
 *   MIRACL compiler/hardware definitions - mirdef.h
 *   For C++ build of library
 */

/*
**	OPTION 1
**/
// #define MR_LITTLE_ENDIAN
// #define MIRACL 64
// #define mr_utype long
// #define mr_unsign64 unsigned long
// #define MR_IBITS 32
// #define MR_LBITS 64
// #define mr_unsign32 unsigned int
// #define MR_FLASH 52
// #define MAXBASE ((mr_small)1<<(MIRACL-1))
// #define MR_BITSINCHAR 8





/*
**	OPTION 2
**/
#define MR_PAIRING_BN
#define AES_SECURITY 128
#define MIRACL 32
#define MR_LITTLE_ENDIAN
#define mr_utype int
#define MR_IBITS 32
#define MR_LBITS 32
#define mr_unsign32 unsigned int
#define mr_dltype long long
#define MR_NOASM
#define MR_FLASH 52
#define MAXBASE ((mr_small)1<<(MIRACL-1))