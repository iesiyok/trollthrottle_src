/**
**	@developer: Ilkan Esiyok
**
**	DAA front-side API, (DAA TPM+Host)
**  Can be used on browsers and nodejs applications
**	Tested with compiling into javascript with Emscripten  
**
**  Requires declaring one of the pairing methods and AES_SECURITY level in mirdef.h file : 
**	MR_PAIRING_CP, MR_PAIRING_MNT, MR_PAIRING_BN, MR_PAIRING_KSS or MR_PAIRING_BLS
**  AES_SECURITY 128, 192 or 256
**	Also miracl.a file, i.e https://github.com/miracl/MIRACL/blob/4bd13901519d329c6c1369fb3322b52fe10c7a6e/lib/linux64_cpp 
**	But, this miracl.a static library must be compiled differently from backend
**	Instead of a C-compiler, emscripten compiler must be used (emcc)
**	e.g. emcc -c -O2 -o mralloc.bc -c mralloc.c ...
**	then. create the static library with:
**	e.g. llvm-ar rc miracl.a *.bc
**
**  Then compile daa_front.cpp with a emscripten compiler. 
**		emcc -c -O2 -std=c++14 daa_front.cpp -o daa_front.bc
**	Then compile with the other modules depending on the curve, e.g for BN Curve:
**		emcc -O1 --bind -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -Wall daa_front.bc bn_pair.bc ecn.bc ecn2.bc zzn12a.bc big.bc zzn.bc zzn2.bc zzn4.bc miracl.a -fvisibility=hidden -o daa_front.js
**
**	An example, mirdef.h file that is compatible with browsers and nodejs apps
** 	mirdef.hbrw file:
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
**/

#include <iostream>
#include <ctime>
#include <cstring>

#include "pairing_3.h"

#include "daa_structs_front.cpp"
#include "daa_helpers.cpp"
#include <sys/time.h>

#include <string.h>
#include <ctime>
#include <typeinfo>
#include <sstream> 

#include <memory> 
#include <emscripten.h>
#include <emscripten/bind.h>

#include <chrono>

using namespace std;
using namespace emscripten;



// extern "C" {


	PFC* pfc_setup(){

		PFC* pfc = new PFC(AES_SECURITY);

		return pfc;
	}
	GPK* gpk_setup(const long seed, PFC* pfc){


		irand((long)seed);

		G1 g1,h1,h2;
		G2 g2,w;
		GT t1,t2,t3,t4;
		Big gamma;

	    Big order=pfc->order();

		pfc->random(g1);
		pfc->random(g2);
		pfc->random(gamma);
		pfc->random(h1);
		pfc->random(h2);

		w=pfc->mult(g2,gamma);

		t1=pfc->pairing(g2,g1); t2=pfc->pairing(g2,h1); t3=pfc->pairing(g2,h2); t4=pfc->pairing(w,h2);

		pfc->precomp_for_mult(g1);
		pfc->precomp_for_mult(g2);
		pfc->precomp_for_mult(h1);
		pfc->precomp_for_mult(h2);
		pfc->precomp_for_mult(w);
		pfc->precomp_for_pairing(g2);

		pfc->precomp_for_power(t1);
		pfc->precomp_for_power(t2);
		pfc->precomp_for_power(t3);
		pfc->precomp_for_power(t4);


		Big prec_hash;

		pfc->start_hash();
    	pfc->add_to_hash(order);
    	pfc->add_to_hash(g1);
    	pfc->add_to_hash(h1);
    	pfc->add_to_hash(h2);
    	pfc->add_to_hash(g2);
    	pfc->add_to_hash(w);
    	prec_hash = pfc->finish_hash_to_group();
		// G1 g1, h1,h2;
		// G2 g2, w;
		// GT t4;
		// Big order, prec_hash;

		// istringstream is_g1(gpk_str.g1);
		// istringstream is_h1(gpk_str.h1);
		// istringstream is_h2(gpk_str.h2);
		// istringstream is_g2(gpk_str.g2);
		// istringstream is_w(gpk_str.w);
		// istringstream is_t4(gpk_str.t4);
		// istringstream is_order(gpk_str.order);
		// istringstream is_prec_h(gpk_str.prec_hash);






		// if(!((is_g1 >> g1) && (is_h1 >> h1) && (is_h2 >> h2) 
		// 	&& (is_g2 >> g2) && (is_w >> w) && (is_t4 >> t4) 
		// 	&& (is_order >>= order) && (is_prec_h >>= prec_hash ))){
		// 	return nullptr;
		// }

		// pfc->precomp_for_mult(g1);
		// pfc->precomp_for_mult(g2);
		// pfc->precomp_for_mult(h1);
		// pfc->precomp_for_mult(h2);
		// pfc->precomp_for_mult(w);
		// pfc->precomp_for_pairing(g2);
		// pfc->precomp_for_pairing(w);
		// pfc->precomp_for_power(t4);


		// ostringstream m_g1, m_h1, m_h2, m_g2, p_g2, p_w, m_w, e_t4;

  //   	m_g1 <<= g1.mtable;
  //   	m_h1 <<= h1.mtable;
  //   	m_h2 <<= h2.mtable;
  //   	m_g2 <<= g2.mtable;
  //   	m_w <<= w.mtable;
  //   	p_g2 <<= g2.ptable;
  //   	p_w <<= w.ptable;
  //   	e_t4 <<= t4.etable;

		// g1.store_precomp(copy_string_to_char(m_g1.str()), g1.mtbits);
  //   	h1.store_precomp(copy_string_to_char(m_h1.str()), h1.mtbits);
  //   	h2.store_precomp(copy_string_to_char(m_h2.str()), h2.mtbits);
  //   	g2.store_precomp(copy_string_to_char(m_g2.str()), g2.mtbits);
  //   	g2.store_pairing_comp(copy_string_to_char(p_g2.str()));
  //   	w.store_pairing_comp(copy_string_to_char(p_w.str()));
  //   	w.store_precomp(copy_string_to_char(m_w.str()), w.mtbits);
  //   	t4.store_precomp(copy_string_to_char(e_t4.str()), t4.etbits);



		// cout << "g1:g::" << h1.mtable[3] << endl;
  //   	cout << "g1:g::" << h1.g << endl;
		
		GPK* gpk_ptr = new GPK(g1, h1, h2, g2, w, t1, t2, t3, t4, gamma, order, prec_hash);

		return gpk_ptr;

	}

	m1 user_join_protocol( string dk_s, string ni_s, 
						 GPK* gpk, PFC* pfc){
		
		Big f;

		char* dk = copy_string_to_char(dk_s);

		size_t len_f = strlen(dk);
		int bytes_per_big=(MIRACL/8)*(get_mip()->nib-1);
		f = from_binary(len_f, dk);//secret key of user

		// pfc->random(f);

		G1 h1;
		h1 = gpk->get_h1();
		// cout << "g1:g::" << h1.mtable[3] << endl;
		Big order, prec_hash;
		order = gpk->get_order();
		prec_hash = gpk->get_prec_hash();

		// pfc->precomp_for_mult(h1);
    	
    	Big sk, rf;
    	G1 F,R;
    	sk = f;
    	
    	pfc->random(rf);
    	F = pfc->mult(h1, f);
    	R = pfc->mult(h1, rf);

    	// cout << "g1:g::" << h1.g << endl;

    	Big ni = copy_string_to_char(ni_s);
    	Big c, sf;
    	
    	pfc->start_hash();
    	pfc->add_to_hash(prec_hash);
    	pfc->add_to_hash(ni);
    	pfc->add_to_hash(F);
    	pfc->add_to_hash(R);
    	c=pfc->finish_hash_to_group();
    	sf = (rf+modmult(c,f,order))%order;

    	ostringstream os_F, os_c, os_sf, os_ni, os_sk, os_xx;	

		os_F << F;
		os_c <<= c;
		os_sf <<= sf;
		os_ni <<= ni;
		os_sk <<= sk;


		// Big xx;
		// pfc->random(xx);
		G2 g2 = gpk->get_g2();
		os_xx << g2;

		m1 m1_p = {os_F.str(), os_c.str(), os_sf.str(), os_ni.str(), os_sk.str(), os_xx.str()};

		return m1_p;
	}

	int user_join_verify( const m2 m2_ptr, 
							 GPK* gpk, PFC* pfc ){

		G1 g1;
		g1 = gpk->get_g1();
		G2 g2, w;
		g2 = gpk->get_g2();
		w = gpk->get_w();

		// cout << "-100000" << endl;

		Big x  = copy_string_to_char(m2_ptr.bytes_x);

		G1 A, F;

		// pfc->random(A);
		// pfc->random(F);

		std::istringstream is_A(m2_ptr.bytes_A);
		std::istringstream is_F(m2_ptr.bytes_F);

		if(!((is_A >> A) && (is_F >> F))){ 
			return -1;
		}
		// cout << "00000" << A.g << endl;
		// cout << "00000" << F.g << endl;

    	// g2.mtable=NULL;
    	// g2.m_store=NULL;
    	// g2.ptable=NULL;
    	// g2.p_store=NULL;
    	// w.mtable=NULL;
    	// w.m_store=NULL;
    	// w.ptable=NULL;
    	// w.p_store=NULL;
  //   	G2 xx;
		// xx=pfc->mult(g2,x);
    	G2 wxg2=w+pfc->mult(g2,x);
    	// wxg2.m_store=NULL;
    	// wxg2.p_store=NULL;
    	// g2.p_store=NULL;
    	// pfc->precomp_for_pairing(wxg2);
    	// cout << "111100000:" << wxg2.mtable[34] << endl;
    	// cout << "111100000:" << g2.mtable[34] << endl;
    	// cout << "111100000:" << xx.mtable[34] << endl;
    	// cout << "111100000:" << w.mtable[34] << endl;
    	G1 g1f=-(F+g1);
    	// g1f.mtable=NULL;
    	// g1f.m_store=NULL;

    	// cout << "022220000" << endl;

    	G1 *gf1[2];
    	// cout << "000www00" << endl;
		G2 *gf2[2];
		// cout << "00000wwww" << endl;
		gf1[0]=&A; gf1[1]=&g1f;
		// cout << "00000222" << endl;
		gf2[0]=&wxg2; gf2[1]=&g2;
		// cout << "00000wwwwwwwwww" << endl;

		// pfc->precomp_for_pairing(gf1);

		// auto start = std::chrono::high_resolution_clock::now();
		// pfc->precomp_for_pairing(wxg2);
		// pfc->precomp_for_pairing(g2);
		// auto finish = std::chrono::high_resolution_clock::now();
		// std::cout << std::chrono::duration_cast<std::chrono::nanoseconds>(finish-start).count() << "ns\n";

		// cout << "gf2:" << gf2[0]->mtable[35] << endl;
		// cout << "gf2:" << gf2[1]->mtable[35] << endl;
		// cout << "gf1:" << gf1[0]->mtable[35] << endl;
		// cout << "gf1:" << gf1[1]->mtable[35] << endl;

		if (pfc->multi_pairing(2,gf2,gf1)!=1)
		{
			return 0;
		}else{
			return 1;
		}
		// return 1;

	}


	signature user_sign( const m3 m3_ptr, GPK* gpk, PFC* pfc){


		G1 h1, h2, nv, A;
		h1 = gpk->get_h1();
		h2 = gpk->get_h2();
		G2 g2;
		g2 = gpk->get_g2();
		GT t4;
		t4 = gpk->get_t4();
		Big order, prec_hash;
		order = gpk->get_order();
		prec_hash = gpk->get_prec_hash();

		istringstream is_nv(m3_ptr.bytes_nv);
		istringstream is_A(m3_ptr.bytes_A);
		// cout << "Daa front" << endl;

		if(!( (is_nv >> nv ) && (is_A >> A) )){

			// cout << "Daa front" << endl;

			return {"", "", "", "", "", "", "", "", ""};

		}

		// cout << "Daa front" << endl;

    	Big f  = copy_string_to_char(m3_ptr.bytes_f);

    	// cout << "Daa front" << endl;

    	G1 B, K, R1, R2t;

    	// cout << "Daa front" << endl;

    	pfc->hash_and_map(B,(char *)copy_string_to_char(m3_ptr.domain)); //domain is set here

    	Big rf;

    	pfc->random(rf);
		K=pfc->mult(B,f);
		R1=pfc->mult(B,rf);
		R2t=pfc->mult(h1,rf);

		Big x  = copy_string_to_char(m3_ptr.bytes_x);

		// cout << "Daa front" << endl;
		

		G1 T;
		GT R2;
		Big a,b,rx,ra,rb,ch,nt;

		pfc->random(a);
		b=modmult(a,x,order);

		// cout << "Daa front0" << endl;

		T=A+pfc->mult(h2,a);

		// pfc->precomp_for_mult(T);
		// pfc->precomp_for_mult(R2t);
		// pfc->precomp_for_pairing(g2);

		pfc->random(rx);
		pfc->random(ra);
		pfc->random(rb);

		// auto start = std::chrono::high_resolution_clock::now();
		// auto finish = std::chrono::high_resolution_clock::now();
		// std::cout << std::chrono::duration_cast<std::chrono::nanoseconds>(finish-start).count() << "ns\n";

		// cout << "Daa front1" << endl;

		R2=pfc->pairing(g2,R2t+pfc->mult(T,-rx)+pfc->mult(h2,rb))*pfc->power(t4,ra);

		// cout << "Daa front2" << endl;

		pfc->start_hash();
		pfc->add_to_hash(prec_hash);
		pfc->add_to_hash(B); pfc->add_to_hash(K); pfc->add_to_hash(T); 
		pfc->add_to_hash(R1); pfc->add_to_hash(R2); pfc->add_to_hash(nv);
		ch=pfc->finish_hash_to_group();

		// cout << "Daa front3" << endl;

		Big c, sf;

		pfc->random(nt);
		pfc->start_hash(); pfc->add_to_hash(ch); pfc->add_to_hash(nt);
		pfc->add_to_hash((char *)copy_string_to_char(m3_ptr.comment));//comment is signed here
		c=pfc->finish_hash_to_group();

		// cout << "Daa front4" << endl;

		sf=(rf+modmult(c,f,order))%order;
		rf=0;
		Big sx,sa,sb;
		sx=(rx+modmult(c,x,order))%order;
		sa=(ra+modmult(c,a,order))%order;
		sb=(rb+modmult(c,b,order))%order;
		// Host outputs signature {B,K,T,c,nt,sf,sx,sa,sb}

		// cout << "Daa front5" << endl;

		ostringstream os_B, os_K, os_T, os_c, os_nt, os_sf, os_sx, os_sa, os_sb ;	

		os_B << B;
		os_K << K;
		os_T << T;
		os_c <<= c;
		os_nt <<= nt;
		os_sf <<= sf;
		os_sx <<= sx;
		os_sa <<= sa;
		os_sb <<= sb;


		signature sig_ptr = {os_B.str(), os_K.str(), os_T.str(), os_c.str(), os_nt.str(), os_sf.str(), os_sx.str(), os_sa.str(), os_sb.str()};
		
		return sig_ptr;

	}

	string create_nym(const string sk, PFC* pfc){
		G1 B, K;

		Big f  = copy_string_to_char(sk);

		const char* bsn = "1";
		pfc->hash_and_map(B,(char *)bsn);

		K = pfc->mult(B, f);

		ostringstream os_K;
		os_K << K;

		return os_K.str();



	}

	string create_nonce( PFC* pfc){

		time_t seed;
		time(&seed);
    	irand((long)seed);

		Big nonce;
		pfc->random(nonce);
		
		char* nonce_str = new char[256];
		nonce_str && nonce;

		string n(nonce_str);
		
		return n;

	}

	cre issuer_join_verify( const m1 m1_ptr, PFC* pfc, GPK* gpk){

// const m3 m3_ptr, GPK* gpk, PFC* pfc
    	// GPK* gpk = gpk_ptr.get();

		char* c_bytes  = copy_string_to_char(m1_ptr.bytes_c);
		char* sf_bytes = copy_string_to_char(m1_ptr.bytes_sf);
		char* ni_bytes = copy_string_to_char(m1_ptr.bytes_ni);
		
		Big c, sf, ni;
	
		c =  c_bytes; 
		sf = sf_bytes; 
		ni = ni_bytes; 
		G1 F;

		istringstream is_F(m1_ptr.bytes_F);

		if(!(is_F >> F)){ 
			return {"", ""};
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

		// int code = 0;

		if (ci!=c)
		{
			// code = 23;
			return {"", ""};

		}else{

			
			pfc->random(x);
			
			G1 xx;
			xx=gpk->get_g1()+F;
			xx.mtable=NULL;
			xx.m_store=NULL;

			A=pfc->mult(xx,inverse(x+gpk->get_gamma(),gpk->get_order()));

			// cre_ptr = (cre*)malloc(sizeof( cre));
			ostringstream os_A;	

			os_A << A;


			// cre_ptr->bytes_A = copy_string_to_char(os_A.str());

			char *x_str = new char[256];
			x_str && x;
			// cre_ptr->bytes_x = x_str;

			string x_s(x_str);

			cre cre_ptr = { os_A.str(), x_s };
			return cre_ptr;
		}	

		// return code;
	}

	int verify_domain(const string domain, const string epoch){
		vector<std::string> seglist;
        stringstream str_domain (domain);
        string segment;

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
	int verifier_verify( GPK* gpk, PFC* pfc, const signature sig, 
							const string nv_str, const string hash_comment, const string domain, const string epoch){

// PFC* pfc, GPK* gpk

		// string dom(domain);
		// string epo(epoch);

		int res = verify_domain(domain, epoch);


		if (res != 1){
        	return res;
	    }


		G1 B, K, T, nv;

		istringstream is_B(sig.bytes_B);
		istringstream is_K(sig.bytes_K);
		istringstream is_T(sig.bytes_T);
		istringstream is_nv(copy_string_to_char(nv_str));

		if(!((is_B >> B) && (is_K >> K) && (is_T >> T) && (is_nv >> nv) ) ){ 
			return 998;
		}

		// stringstream ss6, ss7, ss8, ss9, ss10, ss11;
		// string str6, str7, str8, str9, str10, str11;


		Big c, nt, sf, sx, sa, sb;

		char* c_bytes  = copy_string_to_char(sig.bytes_c);
		char* nt_bytes  = copy_string_to_char(sig.bytes_nt);
		char* sf_bytes  = copy_string_to_char(sig.bytes_sf);
		char* sx_bytes  = copy_string_to_char(sig.bytes_sx);
		char* sa_bytes  = copy_string_to_char(sig.bytes_sa);
		char* sb_bytes  = copy_string_to_char(sig.bytes_sb);

		c = c_bytes;
		nt = nt_bytes;
		sf = sf_bytes;
		sx = sx_bytes;
		sa = sa_bytes;
		sb = sb_bytes;

		
	
		G1 R1c;
		GT R2c;
		Big cc, ch;

		R1c=pfc->mult(B,sf)+pfc->mult(K,-c);
		R2c=pfc->pairing(pfc->mult(gpk->get_g2(),-sx)+pfc->mult(gpk->get_w(),-c),T)*pfc->power(gpk->get_t1(),c)*pfc->power(gpk->get_t2(),sf)*pfc->power(gpk->get_t3(),sb)*pfc->power(gpk->get_t4(),sa);

		pfc->start_hash();
		pfc->add_to_hash(gpk->get_prec_hash()); 
		pfc->add_to_hash(B); pfc->add_to_hash(K); pfc->add_to_hash(T); pfc->add_to_hash(R1c); pfc->add_to_hash(R2c); pfc->add_to_hash(nv);
		ch=pfc->finish_hash_to_group();
		
		pfc->start_hash(); pfc->add_to_hash(ch); pfc->add_to_hash(nt); pfc->add_to_hash((char *)copy_string_to_char(hash_comment));
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


	EMSCRIPTEN_BINDINGS(daa_front) {

    		value_object<Gpk_string>("Gpk_string")
    			.field("g1", &Gpk_string::g1)
    			.field("h1", &Gpk_string::h1)
    			.field("h2", &Gpk_string::h2)
    			.field("g2", &Gpk_string::g2)
    			.field("w",  &Gpk_string::w)
    			.field("t4", &Gpk_string::t4)
    			.field("order", &Gpk_string::order)
    			.field("prec_hash", &Gpk_string::prec_hash)
    			;


    		value_object<m1>("m1")
    			.field("bytes_F", &m1::bytes_F)
    			.field("bytes_c", &m1::bytes_c)
    			.field("bytes_sf", &m1::bytes_sf)
    			.field("bytes_ni", &m1::bytes_ni)
    			.field("bytes_sk", &m1::bytes_sk)
    			.field("bytes_dk", &m1::bytes_dk)
    			;

    		value_object<m2>("m2")
    			.field("bytes_A", &m2::bytes_A)
    			.field("bytes_x", &m2::bytes_x)
    			.field("bytes_F", &m2::bytes_F)
    			;

    		value_object<m3>("m3")
    			.field("bytes_A", &m3::bytes_A)
    			.field("bytes_x", &m3::bytes_x)
    			.field("bytes_nv", &m3::bytes_nv)
    			.field("bytes_f", &m3::bytes_f)
    			.field("domain", &m3::domain)
    			.field("comment", &m3::comment)
    			;

    		value_object<signature>("signature")
    			.field("bytes_B", &signature::bytes_B)
    			.field("bytes_K", &signature::bytes_K)
    			.field("bytes_T", &signature::bytes_T)
    			.field("bytes_c", &signature::bytes_c)
    			.field("bytes_nt", &signature::bytes_nt)
    			.field("bytes_sf", &signature::bytes_sf)
    			.field("bytes_sx", &signature::bytes_sx)
    			.field("bytes_sa", &signature::bytes_sa)
    			.field("bytes_sb", &signature::bytes_sb)
    			;

    		value_object<cre>("cre")
    			// .field("bytes_xx", &cre::bytes_xx)
    			.field("bytes_A", &cre::bytes_A)
    			.field("bytes_x", &cre::bytes_x)
    			;



    		class_<PFC>("PFC");
    		class_<GPK>("GPK");


    		emscripten::function("pfc_setup", &pfc_setup, allow_raw_pointers());
    		emscripten::function("gpk_setup", &gpk_setup, allow_raw_pointers());
    		emscripten::function("user_join_protocol", &user_join_protocol, allow_raw_pointers());
    		emscripten::function("user_join_verify", &user_join_verify, allow_raw_pointers());
    		emscripten::function("user_sign", &user_sign, allow_raw_pointers());
    		emscripten::function("create_nym", &create_nym, allow_raw_pointers());
    		emscripten::function("create_nonce", &create_nonce, allow_raw_pointers());
    		emscripten::function("issuer_join_verify", &issuer_join_verify, allow_raw_pointers());
    		emscripten::function("verifier_verify", &verifier_verify, allow_raw_pointers());


	}




	int main(){
		EM_ASM(
    		console.log("Library is ready..");
  		);
		return 0;
	}

// }