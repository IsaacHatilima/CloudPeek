Pod::Spec.new do |s|
  s.name           = 'ScreenCornerSurface'
  s.version        = '1.0.0'
  s.summary        = 'A display-concentric corner surface for the CloudPeek swipe shell'
  s.description    = 'Uses the public iOS concentric corner API with a legacy fallback.'
  s.author         = 'CloudPeek'
  s.homepage       = 'https://github.com/IsaacHatilima/CloudPeek'
  s.license        = { :type => 'Cloud Peek Source Available License 1.0', :file => '../../../LICENSE' }
  s.platforms      = { :ios => '16.4' }
  s.source         = { :git => 'https://github.com/IsaacHatilima/CloudPeek.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
