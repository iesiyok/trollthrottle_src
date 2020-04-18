/**
**	@developer: Ilkan Esiyok
**
**	DAA Protocol : Brickell & Li
**  A Pairing-Based DAA scheme Further Reducing TPM  Resources
**
**	DAA Backend side API (DAA issuer and verifier)
**  Requires declaring one of the pairing methods and AES_SECURITY level in mirdef.h file : 
**	MR_PAIRING_CP, MR_PAIRING_MNT, MR_PAIRING_BN, MR_PAIRING_KSS or MR_PAIRING_BLS
**  AES_SECURITY 128, 192 or 256
**	Also, miracl.a static library, i.e https://github.com/miracl/MIRACL/blob/4bd13901519d329c6c1369fb3322b52fe10c7a6e/lib/linux64_cpp 
**
**	Then compile with a C++ compiler. 
**		cl -c -O2 -m64 -std=c++14 -fPIC daa_back.cpp
**	Then compile with the other modules depending on the curve, e.g for BN Curve:
**		cl -02 daa_back.o bn_pair.o zzn12a.o ecn2.o zzn4.o zzn2.o big.o zzn.o ecn.o miracl.a
**
**  See more options at: https://github.com/miracl/MIRACL/blob/47943b40b25e5764b1d8dcb44294994c23e05509/source/curve/pairing/daa.cpp
**
**	An example, mirdef.h file that is compatible with debian-buster
** 	mirdef.hdeb file:
		#define MR_PAIRING_BN
		#define AES_SECURITY 128
		#define MR_LITTLE_ENDIAN
		#define MIRACL 64
		#define mr_utype long
		#define mr_unsign64 unsigned long
		#define MR_IBITS 32
		#define MR_LBITS 64
		#define mr_unsign32 unsigned int
		#define MR_FLASH 52
		#define MAXBASE ((mr_small)1<<(MIRACL-1))
		#define MR_BITSINCHAR 8
**/

#include <iostream>
#include <ctime>
#include <cstring>

#include "pairing_3.h"

#include "daa_structs_back.cpp"
#include "daa_helpers.cpp"


#include <ctime>
#include <typeinfo>
#include <sstream>
#include <memory> 

#include <vector>
#include <string> 
#include <sstream>
#include <fstream>


using namespace std;


extern "C" {


	void pfc_setup(PFC*& pfc){

		pfc = new PFC(AES_SECURITY);
	}

	long issuer_setup(unique_ptr<GPK> gpk_ptr, PFC*& pfc, Gpk_string*& gpk_str){

		// time_t seed;
		// time(&seed);//seed is a timestamp, used for randomness also can be taken from the issuer

		//the seed is given hardcoded for simulation and testing purposes

		long seed = 1542564187;
		
		gpk_ptr = move(create_GPK_for_issuer(pfc, seed, gpk_str));

		return seed;

	}


	char* precomp_tester(unique_ptr<GPK> gpk_ptr, PFC*& pfc){

			GPK* gpk = gpk_ptr.get();
			G1 g1;
			g1 = gpk->get_g1();

			Big xx; 
			g1.mtable[50].getx(xx);

	    	char* xx_str = new char[256];
	    	xx_str && xx;

	    	return xx_str;

	}

	char* create_nonce( PFC*& pfc){

		time_t seed;
		time(&seed);
    	irand((long)seed);

		Big nonce;
		pfc->random(nonce);
		
		char* nonce_str = new char[256];
		nonce_str && nonce;
		
		return nonce_str;

	}
	int issuer_join_verify( m1*& m1_ptr,  cre*& cre_ptr, 
		PFC*& pfc, unique_ptr<GPK> gpk_ptr){


    	GPK* gpk = gpk_ptr.get();

		char* c_bytes  = m1_ptr->bytes_c;
		char* sf_bytes = m1_ptr->bytes_sf;
		char* ni_bytes = m1_ptr->bytes_ni;
		
		Big c, sf, ni;
	
		c =  c_bytes; 
		sf = sf_bytes; 
		ni = ni_bytes; 
		G1 F;

		istringstream is_F(m1_ptr->bytes_F);

		if(!(is_F >> F)){ 
			return 22;
		}
		
		G1 Rc, A;
		G1 h1;
		h1 = gpk->get_h1();
		Rc=pfc->mult(h1,sf)+pfc->mult(F,-c);
		Big ci, x;


		pfc->start_hash();
		pfc->add_to_hash(gpk->get_prec_hash());
		pfc->add_to_hash(ni); 
		pfc->add_to_hash(F);
		pfc->add_to_hash(Rc); 
		ci=pfc->finish_hash_to_group();

		int code = 0;

		if (ci!=c)
		{
			code = 23;
		}else{

			
			pfc->random(x);
			
			G1 xx;
			xx=gpk->get_g1()+F;
			xx.mtable=NULL;
			xx.m_store=NULL;

			A=pfc->mult(xx,inverse(x+gpk->get_gamma(),gpk->get_order()));

			cre_ptr = (cre*)malloc(sizeof( cre));
			ostringstream os_A;	

			os_A << A;

			cre_ptr->bytes_A = copy_string_to_char(os_A.str());

			char *x_str = new char[256];
			x_str && x;
			cre_ptr->bytes_x = x_str;
		}	

		return code;
	}
	int verifier_bot_setup(unique_ptr<GPK> gpk_ptr, PFC*& pfc, long seed, char* w_ptr){
		
		gpk_ptr = move(create_GPK_for_verifier_bot(pfc, seed, w_ptr));

		return 0;
	}
	char* create_g1_nonce(PFC*& pfc){
	

		G1 nonce;
		pfc->random(nonce);

		ostringstream nonce_str;
		nonce_str << nonce;

		return copy_string_to_char(nonce_str.str());;
	}

	int verify_domain(std::string domain, std::string epoch){
		std::vector<std::string> seglist;
        std::stringstream str_domain (domain);
        std::string segment;

        while(std::getline(str_domain, segment, '_'))
        {
           seglist.push_back(segment);
        }

        if (seglist[0] == epoch){

            int seq = stoi(seglist[1]);
            if (seq > -1 && seq < 21){
                return 1;
            }else{
                return seq;
            }

        }else{
            return -2;
        }
	}
	int verifier_verify( unique_ptr<GPK> gpk_ptr, PFC*& pfc, signature*& sig, 
							char* nv_str, char* hash_comment, char* domain, char* epoch){


		std::string dom(domain);
		std::string epo(epoch);

		int res = verify_domain(dom, epo);


		if (res != 1){
        	return res;
	    }

		GPK* gpk = gpk_ptr.get();


		G1 B, K, T, nv;

		istringstream is_B(sig->bytes_B);
		istringstream is_K(sig->bytes_K);
		istringstream is_T(sig->bytes_T);
		istringstream is_nv(nv_str);

		if(!((is_B >> B) && (is_K >> K) && (is_T >> T) && (is_nv >> nv) ) ){ 
			return 998;
		}

		stringstream ss6, ss7, ss8, ss9, ss10, ss11;
		string str6, str7, str8, str9, str10, str11;


		Big c, nt, sf, sx, sa, sb;

		c = sig->bytes_c;
		nt = sig->bytes_nt;
		sf = sig->bytes_sf;
		sx = sig->bytes_sx;
		sa = sig->bytes_sa;
		sb = sig->bytes_sb;

		
	
		G1 R1c;
		GT R2c;
		Big cc, ch;

		R1c=pfc->mult(B,sf)+pfc->mult(K,-c);
		R2c=pfc->pairing(pfc->mult(gpk->get_g2(),-sx)+pfc->mult(gpk->get_w(),-c),T)*pfc->power(gpk->get_t1(),c)*pfc->power(gpk->get_t2(),sf)*pfc->power(gpk->get_t3(),sb)*pfc->power(gpk->get_t4(),sa);

		pfc->start_hash();
		pfc->add_to_hash(gpk->get_prec_hash()); 
		pfc->add_to_hash(B); pfc->add_to_hash(K); pfc->add_to_hash(T); pfc->add_to_hash(R1c); pfc->add_to_hash(R2c); pfc->add_to_hash(nv);
		ch=pfc->finish_hash_to_group();
		
		pfc->start_hash(); pfc->add_to_hash(ch); pfc->add_to_hash(nt); pfc->add_to_hash((char *)hash_comment);
		cc=pfc->finish_hash_to_group();


		int code = 0;

		if (cc==c){
			code = 0;
		}
		else{
			code = 9999;
		}
		return code;
	}
	void release_gpk(unique_ptr<GPK> gpk_ptr) {


		GPK* fp = gpk_ptr.release();
 

	    delete fp;
	}

	void release_pfc(PFC* pfc_ptr) {

	  	free(pfc_ptr);
	  	pfc_ptr = NULL;
	}

	void release_char(char* str){
		delete[] str;
	}


}