import SwiftUI

struct ContentView: View {
    @StateObject private var store = WebViewStore()

    var body: some View {
        ZStack(alignment: .top) {
            SpaceWebView(store: store)

            if store.isLoading {
                ProgressView()
                    .controlSize(.small)
                    .padding(.top, 10)
            }
        }
        .toolbar {
            ToolbarItemGroup(placement: .navigation) {
                Button {
                    store.goBack()
                } label: {
                    Image(systemName: "chevron.left")
                }
                .help("后退")
                .disabled(!store.canGoBack)
                .keyboardShortcut("[", modifiers: [.command])

                Button {
                    store.goForward()
                } label: {
                    Image(systemName: "chevron.right")
                }
                .help("前进")
                .disabled(!store.canGoForward)
                .keyboardShortcut("]", modifiers: [.command])

                Button {
                    store.loadHome()
                } label: {
                    Image(systemName: "house")
                }
                .help("返回太空基地")
                .keyboardShortcut("0", modifiers: [.command])

                Button {
                    store.reload()
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .help("重新加载")
                .keyboardShortcut("r", modifiers: [.command])
            }

            ToolbarItem(placement: .principal) {
                Text(store.title)
                    .font(.headline)
                    .lineLimit(1)
            }
        }
    }
}
