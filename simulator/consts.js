/*
** Website/action paths
**/

module.exports={ 

      create_tls_path         : '/issuer/create_tls',
      issue_path              : '/issuer/issue',
      verify_path             : '/issuer/verify',
      verify_id_path          : '/verifier/verify_identity',
      gpk_path                : '/ledger/retrieve_gpk',
      gr_join_start_p         : '/group/join',
      gr_join_check_p         : '/group/join_check',
      gr_join_start_demo_p    : '/group/join_demo',
      gr_join_check_demo_p    : '/group/join_check_demo',
      ver_bot_nonce_p         : '/verifier/nonce',
      ver_bot_verif_p         : '/verify',
      ledger_store_info       : '/ledger/store_info',
      ver_verify_sign_p       : '/verifier/verify_signature',
      ledger_genesis_tuples_p : '/retrieve_genesis_tuples',
      save_comment_p          : '/ledger/save_comment',
      ver_save_comment_p      : '/verifier/save_comment'

 };
