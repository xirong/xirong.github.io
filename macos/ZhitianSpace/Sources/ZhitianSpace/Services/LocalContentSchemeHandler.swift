import Foundation
import WebKit

final class LocalContentSchemeHandler: NSObject, WKURLSchemeHandler {
    private let rootURL: URL
    private let rootPath: String

    init(rootURL: URL) {
        self.rootURL = rootURL.standardizedFileURL
        self.rootPath = self.rootURL.path
        super.init()
    }

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let requestURL = urlSchemeTask.request.url,
              let fileURL = fileURL(for: requestURL) else {
            urlSchemeTask.didFailWithError(Self.error(code: 400, message: "Invalid local content URL"))
            return
        }

        do {
            let data = try Data(contentsOf: fileURL)
            let response = URLResponse(
                url: requestURL,
                mimeType: mimeType(for: fileURL.pathExtension),
                expectedContentLength: data.count,
                textEncodingName: textEncodingName(for: fileURL.pathExtension)
            )
            urlSchemeTask.didReceive(response)
            urlSchemeTask.didReceive(data)
            urlSchemeTask.didFinish()
        } catch {
            urlSchemeTask.didFailWithError(error)
        }
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

    private func fileURL(for requestURL: URL) -> URL? {
        var relativePath = requestURL.path.removingPercentEncoding ?? requestURL.path
        if relativePath.hasPrefix("/") {
            relativePath.removeFirst()
        }
        if relativePath.isEmpty {
            relativePath = "app/index.html"
        }

        let candidateURL = rootURL
            .appendingPathComponent(relativePath, isDirectory: false)
            .standardizedFileURL
        let candidatePath = candidateURL.path

        guard candidatePath == rootPath || candidatePath.hasPrefix(rootPath + "/") else {
            return nil
        }

        return candidateURL
    }

    private func mimeType(for fileExtension: String) -> String {
        switch fileExtension.lowercased() {
        case "html", "htm":
            return "text/html"
        case "css":
            return "text/css"
        case "js":
            return "text/javascript"
        case "json":
            return "application/json"
        case "jpg", "jpeg":
            return "image/jpeg"
        case "png":
            return "image/png"
        case "gif":
            return "image/gif"
        case "svg":
            return "image/svg+xml"
        case "mp3":
            return "audio/mpeg"
        case "wav":
            return "audio/wav"
        case "md", "txt":
            return "text/plain"
        default:
            return "application/octet-stream"
        }
    }

    private func textEncodingName(for fileExtension: String) -> String? {
        switch fileExtension.lowercased() {
        case "html", "htm", "css", "js", "json", "md", "txt":
            return "utf-8"
        default:
            return nil
        }
    }

    private static func error(code: Int, message: String) -> NSError {
        NSError(
            domain: "ZhitianSpace.LocalContent",
            code: code,
            userInfo: [NSLocalizedDescriptionKey: message]
        )
    }
}
