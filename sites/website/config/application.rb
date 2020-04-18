require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module VerifierBotOrg
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    #config.force_ssl = true

    config.time_zone = 'Berlin'

    config.before_configuration do
      env_file = File.join(Rails.root, 'config', 'tuning.yml')
      YAML.load(File.open(env_file)).each do |key, value|
        ENV[key.to_s] = value
      end if File.exists?(env_file)
    end

    # RUBY_GC_TUNE = 1
    # RUBY_GC_TOKEN = 'db178df5bd5b840d9ff2a8a24b1304f6'

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
  end
end
