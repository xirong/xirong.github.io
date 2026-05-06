// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "ZhitianSpace",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(name: "ZhitianSpace", targets: ["ZhitianSpace"])
    ],
    targets: [
        .executableTarget(
            name: "ZhitianSpace",
            path: "Sources/ZhitianSpace"
        )
    ]
)
