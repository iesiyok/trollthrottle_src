/**
** 	@developer: Ilkan Esiyok
**
**	DAA structs used in back-end
**/


#include <memory>

#include "pairing_3.h"
using namespace std;


typedef struct GPK_raw_struct{

			G1 g1, h1, h2;
			G2 g2, w;
			GT t1, t2, t3, t4;
			Big gamma, order, prec_hash;

			GPK_raw_struct(G1 *_g1, G1 *_h1, G1 *_h2, G2 *_g2, G2 *_w, 
				GT *_t1, GT *_t2, GT *_t3, GT *_t4, Big *_gamma, Big *_order, Big *_prec_hash ){
				
				g1 = *_g1;
				h1 = *_h1;
				h2 = *_h2;
				g2 = *_g2;
				w = *_w;
				t1 = *_t1;
				t2 = *_t2;
				t3 = *_t3;
				t4 = *_t4;
				gamma = *_gamma;
				order = *_order;
				prec_hash = *_prec_hash;


			}


} GPK_raw_struct;

//Group public key
class GPK {

		public:
		G1 g1, h1, h2;
		G2 g2, w;
		GT t1, t2, t3, t4;
		Big gamma, order, prec_hash;


		GPK(G1 _g1, G1 _h1, G1 _h2, G2 _g2, G2 _w, 
				GT _t1, GT _t2, GT _t3, GT _t4, Big _gamma, Big _order, Big _prec_hash ){


				g1 <<= _g1; h1 <<= _h1; h2 <<= _h2;
				g2 <<= _g2; w <<= _w;
				t1 <<= _t1; t2 <<= _t2; t3 <<= _t3; t4 <<= _t4;
				gamma = _gamma; order = _order; prec_hash = _prec_hash;

		}
		GPK(G1 _g1, G1 _h1, G1 _h2, G2 _g2, G2 _w, 
				GT _t4, Big _order, Big _prec_hash ){


				g1 <<= _g1; h1 <<= _h1; h2 <<= _h2;
				g2 <<= _g2; w <<= _w;
				t4 <<= _t4;
				order = _order; prec_hash = _prec_hash;

		}

		
			G1 get_g1(){return g1;}
			G1 get_h1(){return h1;}
			G1 get_h2(){return h2;}
			G2 get_g2(){return g2;}
			G2 get_w(){return w;}
			GT get_t1(){return t1;}
			GT get_t2(){return t2;}
			GT get_t3(){return t3;}
			GT get_t4(){return t4;}
			Big get_gamma(){return gamma;}
			Big get_order(){return order;}
			Big get_prec_hash(){return prec_hash;}

		~GPK(){cout << "GPK destruct " << this << endl; }


		
};


typedef struct {

		 char* g1;
		 char* h1;
		 char* h2;
		 char* g2;
		 char* w;
		 char* t4;
		 char* order;
		 char* prec_hash;
 
	              
} Gpk_string;
	

typedef struct {

	char* bytes_F;
	char* bytes_c;
	char* bytes_sf;
	char* bytes_ni;
	char* bytes_sk;
	char* bytes_dk;

} m1;


typedef struct {
	char* bytes_A;
	char* bytes_x;
	char* bytes_F;
} m2;

typedef struct {
	char* bytes_A;
	char* bytes_x;
	char* bytes_nv;
	char* bytes_f;
	char* domain;
	char* comment;
} m3;

typedef struct {
	char* bytes_B;
	char* bytes_K;
	char* bytes_T;
	char* bytes_c;
	char* bytes_nt;
	char* bytes_sf;
	char* bytes_sx;
	char* bytes_sa;
	char* bytes_sb;
} signature;


typedef struct {
	char *bytes_A;
	char *bytes_x;
} cre;
