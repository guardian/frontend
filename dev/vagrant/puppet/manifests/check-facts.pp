class check-role-facts {

  if $role == undef {
    notice('No role variable available from facter. Add to Vagrantfile :facter term if DEV.')
    fail('No role variable available')
  }

}

class check-aws-facts {

  if $aws_key == undef {
    notice('No aws_key variable available from facter. Add to Vagrantfile :facter term if DEV.')
    fail('No aws_key variable available')
  }

  if $aws_secret == undef {
    notice('No aws_secret variable available from facter. Add to Vagrantfile :facter term if DEV.')
    fail('No aws_secret variable available')
  }

  if $aws_region == undef {
    notice('No aws_region variable available from facter. Add to Vagrantfile :facter term if DEV.')
    fail('No aws_region variable available')
  }

}

class check-stage-facts {

  if $int_service_domain == undef {
    notice('No int_service_domain variable available from facter. Add to Vagrantfile :facter term if DEV.')
    fail('No int_service_domain variable available')
  }

  if $stage == undef {
    notice('No stage variable available from facter. Add to Vagrantfile :facter term if DEV.')
    fail('No stage variable available')
  }

}
