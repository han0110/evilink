{
    'targets': [
        {
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            'target_name': 'chainlink_vrf',
            'sources': [
                './go/build/chainlink_vrf.h',
                'addon.cc'
            ],
            'libraries': ['../go/build/chainlink_vrf.a'],
            "include_dirs": ["<!@(node -p \"require('node-addon-api').include\")"],
            'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS'],
            'conditions': [
                ['OS=="mac"', {
                    'link_settings': {
                        'libraries': [
                            '$(SDKROOT)/System/Library/Frameworks/Security.framework',
                        ],
                    },
                }],
            ]
        }
    ]
}
