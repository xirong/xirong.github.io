import Foundation
import WebKit

@MainActor
final class WebViewStore: ObservableObject {
    @Published var canGoBack = false
    @Published var canGoForward = false
    @Published var isLoading = false
    @Published var title = "智天太空探险"

    private weak var webView: WKWebView?
    let contentRootURL: URL
    let homeURL: URL

    init() {
        guard let resourceURL = Bundle.main.resourceURL else {
            fatalError("Bundle resources are missing.")
        }

        contentRootURL = resourceURL.appendingPathComponent("WebContent", isDirectory: true)
        homeURL = contentRootURL
            .appendingPathComponent("app", isDirectory: true)
            .appendingPathComponent("index.html")
    }

    func attach(_ webView: WKWebView) {
        self.webView = webView
        loadHome()
    }

    func loadHome() {
        webView?.loadFileURL(homeURL, allowingReadAccessTo: contentRootURL)
    }

    func goBack() {
        webView?.goBack()
    }

    func goForward() {
        webView?.goForward()
    }

    func reload() {
        webView?.reload()
    }

    func openCurrentPageInBrowser() {
        guard let url = webView?.url else { return }
        NSWorkspace.shared.open(url)
    }

    func refreshNavigationState(from webView: WKWebView) {
        canGoBack = webView.canGoBack
        canGoForward = webView.canGoForward
        isLoading = webView.isLoading
        title = webView.title?.isEmpty == false ? webView.title! : "智天太空探险"
    }
}
