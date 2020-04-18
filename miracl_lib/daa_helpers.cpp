
/**
**
** @developer: Ilkan Esiyok
**
** DAA Helper functions for both front and back ends.
**/

char* copy_string_to_char(std::string s){
		char *p = new char[s.length()+1];
		std::strcpy(p, s.c_str());
		return p;
}

char* appendCharToCharArray(char* array, char a)
{
    size_t len = strlen(array);

    char* ret = new char[len+2];

    strcpy(ret, array);    
    ret[len] = a;
    ret[len+1] = '\0';

    return ret;
}

unique_ptr<GPK> create_GPK_for_issuer(PFC*& pfc, long& seed, Gpk_string*& gpk_str){

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

    	ostringstream m_g1, m_h1, m_h2, m_g2, p_g2, m_w, e_t1, e_t2, e_t3, e_t4;

    	m_g1 <<= g1.mtable;
    	m_h1 <<= h1.mtable;
    	m_h2 <<= h2.mtable;
    	m_g2 <<= g2.mtable;
    	m_w <<= w.mtable;
    	p_g2 <<= g2.ptable;
    	e_t1 <<= t1.etable;
    	e_t2 <<= t2.etable;
    	e_t3 <<= t3.etable;
    	e_t4 <<= t4.etable;

    	g1.store_precomp(copy_string_to_char(m_g1.str()), g1.mtbits);
    	h1.store_precomp(copy_string_to_char(m_h1.str()), h1.mtbits);
    	h2.store_precomp(copy_string_to_char(m_h2.str()), h2.mtbits);
    	g2.store_precomp(copy_string_to_char(m_g2.str()), g2.mtbits);
    	g2.store_pairing_comp(copy_string_to_char(p_g2.str()));
    	w.store_precomp(copy_string_to_char(m_w.str()), w.mtbits);

    	t1.store_precomp(copy_string_to_char(e_t1.str()), t1.etbits);
    	t2.store_precomp(copy_string_to_char(e_t2.str()), t2.etbits);
    	t3.store_precomp(copy_string_to_char(e_t3.str()), t3.etbits);
    	t4.store_precomp(copy_string_to_char(e_t4.str()), t4.etbits);
    	

		unique_ptr<GPK> g_x(new GPK(g1, h1, h2, g2, w, t1, t2, t3, t4, gamma, order, prec_hash));

    	ostringstream os_g1, os_h1, os_h2, os_g2, os_w, os_t4, os_order, os_prec_hash;	

		os_g1 << g1;

		os_h1 << h1;
		os_h2 << h2;
		os_g2 << g2;
		os_w << w;
		os_t4 << t4;
		os_order <<= order;
		os_prec_hash <<= prec_hash;

		gpk_str = (Gpk_string*)malloc(sizeof(Gpk_string));

		gpk_str->g1 = copy_string_to_char(os_g1.str());
		gpk_str->h1 = copy_string_to_char(os_h1.str());
		gpk_str->h2 = copy_string_to_char(os_h2.str());
		gpk_str->g2 = copy_string_to_char(os_g2.str());
		gpk_str->w = copy_string_to_char(os_w.str());
		gpk_str->t4 = copy_string_to_char(os_t4.str());
		std::string o_s = os_order.str();
		o_s += '\n';
		gpk_str->order = copy_string_to_char(o_s);
		std::string o_prec = os_prec_hash.str();
		o_prec += '\n';
		gpk_str->prec_hash = copy_string_to_char(o_prec);

		return g_x;


}

unique_ptr<GPK> create_GPK_for_verifier_bot(PFC*& pfc, long seed, char* string_of_w){

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

		istringstream is_w(string_of_w);
		is_w >> w;


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

    	ostringstream m_g1, m_h1, m_h2, m_g2, p_g2, m_w, e_t1, e_t2, e_t3, e_t4;

    	m_g1 <<= g1.mtable;

    	m_h1 <<= h1.mtable;
    	m_h2 <<= h2.mtable;
    	m_g2 <<= g2.mtable;
    	m_w <<= w.mtable;
    	p_g2 <<= g2.ptable;

    	e_t1 <<= t1.etable;
    	e_t2 <<= t2.etable;
    	e_t3 <<= t3.etable;
    	e_t4 <<= t4.etable;

    	g1.store_precomp(copy_string_to_char(m_g1.str()), g1.mtbits);
    	h1.store_precomp(copy_string_to_char(m_h1.str()), h1.mtbits);
    	h2.store_precomp(copy_string_to_char(m_h2.str()), h2.mtbits);
    	g2.store_precomp(copy_string_to_char(m_g2.str()), g2.mtbits);
    	g2.store_pairing_comp(copy_string_to_char(p_g2.str()));
    	w.store_precomp(copy_string_to_char(m_w.str()), w.mtbits);

    	t1.store_precomp(copy_string_to_char(e_t1.str()), t1.etbits);
    	t2.store_precomp(copy_string_to_char(e_t2.str()), t2.etbits);
    	t3.store_precomp(copy_string_to_char(e_t3.str()), t3.etbits);
    	t4.store_precomp(copy_string_to_char(e_t4.str()), t4.etbits);

  

		unique_ptr<GPK> g_x(new GPK(g1, h1, h2, g2, w, t1, t2, t3, t4, gamma, order, prec_hash));


		return g_x;


}

void create_GPK_String( long seed, char* string_of_w, Gpk_string*& gpk_str ){
		PFC* pfc = new PFC(AES_SECURITY);
    	irand(seed);

    	G1 g1,h1,h2;
		G2 g2,w;
		GT t4;
		Big gamma;

	    Big order=pfc->order();

		pfc->random(g1);
		pfc->random(g2);
		pfc->random(gamma);
		pfc->random(h1);
		pfc->random(h2);


		istringstream is_w(string_of_w);
		is_w >> w; 

		t4=pfc->pairing(w,h2);

		Big prec_hash;

		pfc->start_hash();
    	pfc->add_to_hash(order);
    	pfc->add_to_hash(g1);
    	pfc->add_to_hash(h1);
    	pfc->add_to_hash(h2);
    	pfc->add_to_hash(g2);
    	pfc->add_to_hash(w);
    	prec_hash = pfc->finish_hash_to_group();


    	ostringstream os_g1, os_h1, os_h2, os_g2, os_w, os_t4, os_order, os_prec_hash;	

		os_g1 << g1;
		os_h1 << h1;
		os_h2 << h2;
		os_g2 << g2;
		os_w << w;
		os_t4 << t4;

		os_order <<= order;
		os_prec_hash <<= prec_hash;

		
		gpk_str->g1 = copy_string_to_char(os_g1.str());
		gpk_str->h1 = copy_string_to_char(os_h1.str());
		gpk_str->h2 = copy_string_to_char(os_h2.str());
		gpk_str->g2 = copy_string_to_char(os_g2.str());
		gpk_str->w = copy_string_to_char(os_w.str());
		gpk_str->t4 = copy_string_to_char(os_t4.str());
		std::string o_s = os_order.str();
		o_s += '\n';
		gpk_str->order = copy_string_to_char(o_s);
		std::string o_prec = os_prec_hash.str();
		o_prec += '\n';
		gpk_str->prec_hash = copy_string_to_char(o_prec);
		
		

}


G1 byte_to_g1(char* x, char* y){

		G1 g1;
		ECn ecn_g1(x, y);
		g1.g = ecn_g1;
		
		return g1;
}

