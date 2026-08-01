import type { Problem, Snippet, KnowledgeArticle } from './supabase';

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: '1', stt: 1, title: 'Segment Tree cơ bản', problem_code: 'SEGTREE',
    platform: 'VNOI', difficulty: 'Medium',
    tags: ['segment-tree', 'data-structure'],
    problem_url: 'https://vnoi.info', notes: 'Cần nắm vững lazy propagation',
    solve_full_type: 'external_url', solve_full_value: 'https://vnoi.info/wiki/algo/data-structures/segment-tree-extend.md',
    solve_trick: 'Chia đôi đệ quy, cập nhật lazy', status: 'AC',
    kb_article_id: null, created_at: '2024-01-01'
  },
  {
    id: '2', stt: 2, title: 'Dijkstra trên đồ thị', problem_code: 'DIJKSTRA',
    platform: 'Codeforces', difficulty: 'Medium',
    tags: ['dijkstra', 'shortest-path', 'graph'],
    problem_url: 'https://codeforces.com', notes: 'Dùng priority_queue với pair',
    solve_full_type: 'internal_snippet', solve_full_value: 'snippet-1',
    solve_trick: 'Priority queue + visited array', status: 'TLE',
    kb_article_id: null, created_at: '2024-01-02'
  },
  {
    id: '3', stt: 3, title: 'Prefix Sum nâng cao', problem_code: 'PSUM',
    platform: 'Ntucoder', difficulty: 'Easy',
    tags: ['prefix-sum', 'array'],
    problem_url: 'https://ntucoder.net', notes: 'Áp dụng 2D prefix sum',
    solve_full_type: 'external_url', solve_full_value: 'https://cp-algorithms.com/algebra/prefix-sums.html',
    solve_trick: 'Mảng tổng tiền tố 2 chiều', status: 'WA',
    kb_article_id: null, created_at: '2024-01-03'
  },
  {
    id: '4', stt: 4, title: 'Dynamic Programming - LCS', problem_code: 'LCS',
    platform: 'SPOJ', difficulty: 'Hard',
    tags: ['dp', 'string', 'lcs'],
    problem_url: 'https://www.spoj.com', notes: 'Longest Common Subsequence chuẩn',
    solve_full_type: null, solve_full_value: null,
    solve_trick: null, status: 'Todo',
    kb_article_id: null, created_at: '2024-01-04'
  },
  {
    id: '5', stt: 5, title: 'BFS Shortest Path Grid', problem_code: 'BFSGRID',
    platform: 'CSES', difficulty: 'Easy',
    tags: ['bfs', 'graph', 'grid'],
    problem_url: 'https://cses.fi', notes: 'BFS 4 hướng trên grid',
    solve_full_type: 'internal_snippet', solve_full_value: 'snippet-2',
    solve_trick: 'Queue + mark visited ngay khi enqueue', status: 'AC',
    kb_article_id: null, created_at: '2024-01-05'
  },
  {
    id: '6', stt: 6, title: 'Binary Search on Answer', problem_code: 'BISEARCH',
    platform: 'LQDOJ', difficulty: 'Medium',
    tags: ['binary-search', 'greedy'],
    problem_url: 'https://lqdoj.edu.vn', notes: 'Tìm kiếm nhị phân trên kết quả',
    solve_full_type: null, solve_full_value: null,
    solve_trick: 'Check function phải monotone', status: 'AC',
    kb_article_id: null, created_at: '2024-01-06'
  },
  {
    id: '7', stt: 7, title: 'Fenwick Tree / BIT', problem_code: 'FENWICK',
    platform: 'VNOI', difficulty: 'Medium',
    tags: ['fenwick-tree', 'data-structure', 'bit'],
    problem_url: 'https://vnoi.info', notes: 'BIT hỗ trợ update point + query range',
    solve_full_type: 'internal_snippet', solve_full_value: 'snippet-3',
    solve_trick: 'i & (-i) trick', status: 'AC',
    kb_article_id: null, created_at: '2024-01-07'
  },
  {
    id: '8', stt: 8, title: 'Convex Hull', problem_code: 'CHULL',
    platform: 'Codeforces', difficulty: 'Hard',
    tags: ['geometry', 'convex-hull', 'sorting'],
    problem_url: 'https://codeforces.com', notes: 'Graham scan hoặc Andrew monotone chain',
    solve_full_type: null, solve_full_value: null,
    solve_trick: null, status: 'Todo',
    kb_article_id: null, created_at: '2024-01-08'
  },
];

export const MOCK_SNIPPETS: Snippet[] = [
  {
    id: 'snippet-1',
    short_id: 'a8f9x2',
    user_id: 'user-1',
    title: 'Dijkstra Standard (C++)',
    language: 'cpp',
    code: `#include <bits/stdc++.h>
using namespace std;
typedef pair<long long,int> pli;
const long long INF = 1e18;

void dijkstra(int src, vector<vector<pair<int,int>>>& adj, vector<long long>& dist) {
    int n = dist.size();
    fill(dist.begin(), dist.end(), INF);
    dist[src] = 0;
    priority_queue<pli, vector<pli>, greater<pli>> pq;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
}`,
    notes: 'Dijkstra chuẩn với priority_queue, độ phức tạp O((V+E) log V)',
    sample_input: '5 6\n1 2 7\n1 3 9\n1 6 14\n2 3 10\n2 4 15\n3 6 2',
    sample_output: 'Dist from 1: 0 7 9 20 20 11',
    is_public: true,
    tags: ['dijkstra', 'graph', 'shortest-path'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'snippet-2',
    short_id: 'k3p7m1',
    user_id: 'user-1',
    title: 'BFS Grid Template (C++)',
    language: 'cpp',
    code: `#include <bits/stdc++.h>
using namespace std;

int dx[] = {0, 0, 1, -1};
int dy[] = {1, -1, 0, 0};

int bfs(vector<string>& grid, int sx, int sy, int ex, int ey) {
    int n = grid.size(), m = grid[0].size();
    vector<vector<int>> dist(n, vector<int>(m, -1));
    queue<pair<int,int>> q;
    dist[sx][sy] = 0;
    q.push({sx, sy});
    while (!q.empty()) {
        auto [x, y] = q.front(); q.pop();
        if (x == ex && y == ey) return dist[x][y];
        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            if (nx >= 0 && nx < n && ny >= 0 && ny < m
                && grid[nx][ny] != '#' && dist[nx][ny] == -1) {
                dist[nx][ny] = dist[x][y] + 1;
                q.push({nx, ny});
            }
        }
    }
    return -1;
}`,
    notes: 'BFS tìm đường ngắn nhất trên grid 2D',
    sample_input: '5 5\n.####\n....#\n#....\n#####\n.....',
    sample_output: '8',
    is_public: true,
    tags: ['bfs', 'grid', 'graph'],
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
  },
  {
    id: 'snippet-3',
    short_id: 'q9w2e4',
    user_id: 'user-1',
    title: 'Fenwick Tree / BIT (C++)',
    language: 'cpp',
    code: `#include <bits/stdc++.h>
using namespace std;

struct BIT {
    int n;
    vector<long long> tree;
    BIT(int n) : n(n), tree(n + 1, 0) {}
    void update(int i, long long val) {
        for (; i <= n; i += i & (-i))
            tree[i] += val;
    }
    long long query(int i) {
        long long s = 0;
        for (; i > 0; i -= i & (-i))
            s += tree[i];
        return s;
    }
    long long query(int l, int r) {
        return query(r) - query(l - 1);
    }
};`,
    notes: 'Fenwick Tree (BIT) - point update, range query',
    sample_input: '5\n1 2 3 4 5\nQ 1 3\nU 2 10\nQ 1 3',
    sample_output: '6\n14',
    is_public: true,
    tags: ['fenwick-tree', 'bit', 'data-structure'],
    created_at: '2024-01-03',
    updated_at: '2024-01-03',
  },
];

export const MOCK_KB_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'kb-1',
    author_id: 'user-1',
    title: 'Segment Tree - Cây Phân Đoạn',
    slug: 'segment-tree',
    content: `# Segment Tree - Cây Phân Đoạn

## Giới thiệu

**Segment Tree** (Cây phân đoạn) là một cấu trúc dữ liệu dạng cây cho phép thực hiện các truy vấn và cập nhật trên một đoạn mảng trong thời gian $O(\\log n)$.

## Ứng dụng

- **Range Sum Query**: Tính tổng trên đoạn $[l, r]$
- **Range Minimum/Maximum Query**: Tìm min/max trên đoạn
- **Lazy Propagation**: Cập nhật đoạn $[l, r]$ trong $O(\\log n)$

## Cấu trúc

Cây nhị phân đầy đủ với $2 \\times 2^{\\lceil \\log_2 n \\rceil}$ nút. Mỗi nút lưu giá trị của một đoạn con.

\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
long long tree[4 * MAXN];

void build(int* a, int node, int l, int r) {
    if (l == r) { tree[node] = a[l]; return; }
    int mid = (l + r) / 2;
    build(a, 2*node, l, mid);
    build(a, 2*node+1, mid+1, r);
    tree[node] = tree[2*node] + tree[2*node+1];
}

long long query(int node, int l, int r, int ql, int qr) {
    if (ql > r || qr < l) return 0;
    if (ql <= l && r <= qr) return tree[node];
    int mid = (l + r) / 2;
    return query(2*node, l, mid, ql, qr)
         + query(2*node+1, mid+1, r, ql, qr);
}
\`\`\`

## Độ phức tạp

| Thao tác | Thời gian |
|----------|-----------|
| Build    | $O(n)$    |
| Query    | $O(\\log n)$ |
| Update   | $O(\\log n)$ |

## Lazy Propagation

Khi cần cập nhật cả đoạn $[l, r]$, dùng **lazy propagation** để trì hoãn cập nhật:

$$\\text{tree}[v] = \\text{tree}[v] + (r - l + 1) \\times \\text{lazy}[v]$$

> **Lưu ý:** Phải push-down lazy trước khi đệ quy xuống con.

## Bài tập liên quan

Xem phần **Bài tập thực hành** bên dưới.`,
    tags: ['segment-tree', 'data-structure', 'range-query'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'kb-2',
    author_id: 'user-1',
    title: 'Dijkstra - Đường đi ngắn nhất',
    slug: 'dijkstra',
    content: `# Thuật toán Dijkstra

## Giới thiệu

**Dijkstra** là thuật toán tìm đường đi ngắn nhất từ một nguồn đến tất cả các đỉnh khác trong đồ thị có trọng số **không âm**.

## Ý tưởng chính

Duy trì tập $S$ các đỉnh đã tìm được đường đi ngắn nhất. Mỗi bước chọn đỉnh $u \\notin S$ có $dist[u]$ nhỏ nhất, thêm vào $S$ và relaxation các cạnh xuất phát từ $u$.

## Cài đặt với Priority Queue

\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
typedef pair<long long, int> pli;
const long long INF = 1e18;

vector<long long> dijkstra(int src, int n, 
    vector<vector<pair<int,int>>>& adj) {
    vector<long long> dist(n + 1, INF);
    dist[src] = 0;
    priority_queue<pli, vector<pli>, greater<pli>> pq;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}
\`\`\`

## Độ phức tạp

$$O((V + E) \\log V)$$

## Lưu ý

- **Không hoạt động** với cạnh âm (dùng Bellman-Ford).
- Với dense graph, dùng $O(V^2)$ Dijkstra không heap.

## So sánh thuật toán

| Thuật toán | Độ phức tạp | Cạnh âm |
|------------|-------------|---------|
| Dijkstra (Heap) | $O((V+E)\\log V)$ | Không |
| Bellman-Ford | $O(VE)$ | Có |
| Floyd-Warshall | $O(V^3)$ | Có |`,
    tags: ['dijkstra', 'shortest-path', 'graph'],
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
  },
  {
    id: 'kb-3',
    author_id: 'user-1',
    title: 'Dynamic Programming - Quy hoạch động',
    slug: 'dynamic-programming',
    content: `# Quy hoạch động (Dynamic Programming)

## Định nghĩa

**DP** là kỹ thuật chia bài toán lớn thành các bài toán con chồng chéo (overlapping subproblems) và lưu kết quả để tránh tính lại.

## Hai dạng cài đặt

### 1. Top-down (Memoization)

\`\`\`cpp
int memo[1005][1005];
memset(memo, -1, sizeof(memo));

int dp(int i, int j) {
    if (i == 0 || j == 0) return 0;
    if (memo[i][j] != -1) return memo[i][j];
    if (a[i] == b[j])
        return memo[i][j] = 1 + dp(i-1, j-1);
    return memo[i][j] = max(dp(i-1, j), dp(i, j-1));
}
\`\`\`

### 2. Bottom-up (Tabulation)

\`\`\`cpp
int dp[1005][1005] = {};
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) {
        if (a[i] == b[j]) dp[i][j] = dp[i-1][j-1] + 1;
        else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
    }
\`\`\`

## Các dạng DP phổ biến

| Dạng | Ví dụ |
|------|-------|
| DP 1D | Fibonacci, Coin Change |
| DP 2D | LCS, Edit Distance |
| DP Bitmask | TSP, Set Cover |
| DP Cây | Độc lập tập cực đại |
| DP Chữ số | Đếm số thỏa điều kiện |

## Phân tích bài toán DP

1. **Xác định trạng thái:** $dp[i]$ = ?
2. **Viết công thức chuyển:** $dp[i] = f(dp[j])$
3. **Xác định base case**
4. **Thứ tự tính toán**

> **Tip:** Nếu có overlapping subproblems + optimal substructure → DP!`,
    tags: ['dp', 'dynamic-programming', 'optimization'],
    created_at: '2024-01-03',
    updated_at: '2024-01-03',
  },
];
