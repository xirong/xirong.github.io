import SwiftUI
import WebKit

struct SpaceWebView: NSViewRepresentable {
    @ObservedObject var store: WebViewStore

    func makeCoordinator() -> Coordinator {
        Coordinator(store: store)
    }

    func makeNSView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = true
        configuration.websiteDataStore = .default()
        configuration.allowsAirPlayForMediaPlayback = false
        configuration.setURLSchemeHandler(store.schemeHandler, forURLScheme: "zhitian-space")

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.customUserAgent = "ZhitianSpaceApp/1.0 WKWebView"

        if #available(macOS 13.3, *) {
            webView.isInspectable = true
        }

        context.coordinator.observe(webView)
        store.attach(webView)
        return webView
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        private weak var store: WebViewStore?
        private var observations: [NSKeyValueObservation] = []

        init(store: WebViewStore) {
            self.store = store
        }

        func observe(_ webView: WKWebView) {
            observations = [
                webView.observe(\.canGoBack, options: [.new]) { [weak self] webView, _ in
                    Task { @MainActor in self?.store?.refreshNavigationState(from: webView) }
                },
                webView.observe(\.canGoForward, options: [.new]) { [weak self] webView, _ in
                    Task { @MainActor in self?.store?.refreshNavigationState(from: webView) }
                },
                webView.observe(\.isLoading, options: [.new]) { [weak self] webView, _ in
                    Task { @MainActor in self?.store?.refreshNavigationState(from: webView) }
                },
                webView.observe(\.title, options: [.new]) { [weak self] webView, _ in
                    Task { @MainActor in self?.store?.refreshNavigationState(from: webView) }
                }
            ]
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            store?.refreshNavigationState(from: webView)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            store?.refreshNavigationState(from: webView)
            NSLog("ZhitianSpace navigation failed: %@", error.localizedDescription)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            store?.refreshNavigationState(from: webView)
            NSLog("ZhitianSpace provisional navigation failed: %@", error.localizedDescription)
        }
    }
}
