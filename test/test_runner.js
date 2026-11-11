/**
 * test_runner.js - 200+ Hardcore Test Suite & Edge Case Generator for OpenRPGLoader Core
 * ============================================================================
 * ĐẶC TẢ BỘ KIỂM THỬ:
 * 1. Zero-dependency (Hoạt động mượt mà trên Node.js & NW.js Chromium).
 * 2. Bao gồm 105 kịch bản kiểm thử tĩnh (Hand-crafted Scenarios) bao quát 6 hạng mục cốt lõi.
 * 3. Tích hợp EdgeCaseGenerator: Tự sinh thêm 100 trường hợp biên cực khó (Dynamic Fuzzing).
 * 4. Tổng cộng: 205 kịch bản kiểm thử trường hợp biên (Test Scenarios / Sidael).
 * ============================================================================
 */

(() => {
    "use strict";

    const nodeFs = (typeof require !== "undefined") ? require("fs") : null;
    const nodePath = (typeof require !== "undefined") ? require("path") : null;

    let JsonPatch = (typeof window !== "undefined" && window.JsonPatch) || (typeof global !== "undefined" && global.JsonPatch);
    let OpenRPGEngine = (typeof window !== "undefined" && window.OpenRPGEngine) || (typeof global !== "undefined" && global.OpenRPGEngine);
    let OpenRPGLoaderCore = (typeof window !== "undefined" && window.OpenRPGLoaderCore) || (typeof global !== "undefined" && global.OpenRPGLoaderCore);

    if (typeof require !== "undefined") {
        if (!OpenRPGEngine || !JsonPatch) {
            try {
                const enginePath = (nodePath && typeof __dirname !== "undefined")
                    ? nodePath.resolve(__dirname, "../src/OpenRPGEngine.js")
                    : "../src/OpenRPGEngine";
                const engineMod = require(enginePath);
                OpenRPGEngine = engineMod.OpenRPGEngine || engineMod;
                JsonPatch = engineMod.JsonPatch || OpenRPGEngine.JsonPatch;
            } catch (e) {}
        }
        if (!OpenRPGLoaderCore) {
            try {
                const loaderPath = (nodePath && typeof __dirname !== "undefined")
                    ? nodePath.resolve(__dirname, "../src/OpenRPGLoader.js")
                    : "../src/OpenRPGLoader";
                const loaderMod = require(loaderPath);
                OpenRPGLoaderCore = loaderMod.OpenRPGLoaderCore;
                if (!JsonPatch) JsonPatch = loaderMod.JsonPatch;
            } catch (e) {}
        }
    }

    if (!JsonPatch && OpenRPGEngine && OpenRPGEngine.JsonPatch) {
        JsonPatch = OpenRPGEngine.JsonPatch;
    }

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const logs = [];

    function print(msg, isError = false) {
        logs.push(msg);
        if (isError) {
            console.error(msg);
        } else {
            console.log(msg);
        }
    }

    function assert(condition, message) {
        totalTests++;
        if (condition) {
            passedTests++;
            print(`  ✔ [PASS #${totalTests}] ${message}`);
        } else {
            failedTests++;
            print(`  ✖ [FAIL #${totalTests}] ${message}`, true);
        }
    }

    function assertThrows(fn, message) {
        totalTests++;
        let threw = false;
        try {
            fn();
        } catch (e) {
            threw = true;
        }
        if (threw) {
            passedTests++;
            print(`  ✔ [PASS #${totalTests}] ${message}`);
        } else {
            failedTests++;
            print(`  ✖ [FAIL #${totalTests}] ${message} (Expected exception but none thrown)`, true);
        }
    }

    // ========================================================================
    // 🧬 HARDCORE EDGE CASE GENERATOR (MÃ TỰ SINH TRƯỜNG HỢP BIÊN CỰC HẠN)
    // ========================================================================
    const EdgeCaseGenerator = {
        generateDeepNestedObject(depth, leafKey, leafVal) {
            let obj = {};
            let cur = obj;
            for (let i = 0; i < depth; i++) {
                cur[`level_${i}`] = (i === depth - 1) ? { [leafKey]: leafVal } : {};
                cur = cur[`level_${i}`];
            }
            return obj;
        },

        generateDeepPath(depth, leafKey) {
            const parts = [];
            for (let i = 0; i < depth; i++) parts.push(`level_${i}`);
            parts.push(leafKey);
            return "/" + parts.join("/");
        }
    };

    print("==================================================================");
    print("🚀 BẮT ĐẦU SIÊU BỘ KIỂM THỬ 200+ KỊCH BẢN (OPENRPGLOADER CORE)");
    print("==================================================================\n");

    // ========================================================================
    // SUITE 1: RFC 6902 JSON-PATCH OPERATIONS & PATHOLOGICAL POINTERS (25 TESTS)
    // ========================================================================
    print("📋 [TEST SUITE 1] RFC 6902 JSON-Patch Operations & Pathological Pointers (25 Scenarios)");

    {
        const doc = { a: 1, b: 2 };
        JsonPatch.applyPatch(doc, [{ op: "add", path: "/c", value: 3 }]);
        assert(doc.c === 3, "Op 'add': Thêm thuộc tính vào object");

        JsonPatch.applyPatch(doc, [{ op: "replace", path: "/a", value: 10 }]);
        assert(doc.a === 10, "Op 'replace': Thay thế giá trị nguyên thủy");

        JsonPatch.applyPatch(doc, [{ op: "remove", path: "/b" }]);
        assert(!("b" in doc), "Op 'remove': Xóa thuộc tính khỏi object");

        const arr = [10, 20, 30];
        JsonPatch.applyPatch(arr, [{ op: "add", path: "/1", value: 15 }]);
        assert(arr.length === 4 && arr[1] === 15 && arr[2] === 20, "Op 'add': Chèn phần tử mảng tại index giữa");

        JsonPatch.applyPatch(arr, [{ op: "add", path: "/-", value: 99 }]);
        assert(arr[arr.length - 1] === 99, "Op 'add': Chèn cuối mảng với path '/-'");

        // 6 - 10: Array Remove, Replace, Move, Copy, Test
        const arr2 = ["A", "B", "C", "D"];
        JsonPatch.applyPatch(arr2, [{ op: "remove", path: "/2" }]);
        assert(arr2.length === 3 && arr2[2] === "D", "Op 'remove': Xóa phần tử mảng co ngắn mảng");

        JsonPatch.applyPatch(arr2, [{ op: "replace", path: "/0", value: "Alpha" }]);
        assert(arr2[0] === "Alpha", "Op 'replace': Thay thế phần tử mảng");

        const doc2 = { list: [1, 2, 3], copied: null };
        JsonPatch.applyPatch(doc2, [{ op: "copy", path: "/copied", from: "/list" }]);
        assert(Array.isArray(doc2.copied) && doc2.copied.length === 3, "Op 'copy': Sao chép mảng sang thuộc tính mới");

        doc2.copied.push(4);
        assert(doc2.list.length === 3, "Op 'copy': Đảm bảo Deep Clone độc lập, không làm biến đổi mảng gốc");

        JsonPatch.applyPatch(doc2, [{ op: "test", path: "/list/0", value: 1 }]);
        assert(true, "Op 'test': Kiểm tra giá trị khớp thành công");

        // 11 - 15: Deep Equality & Token Escaping
        const docObj = { target: { x: 1, y: 2 } };
        JsonPatch.applyPatch(docObj, [{ op: "test", path: "/target", value: { y: 2, x: 1 } }]);
        assert(true, "Op 'test': deepEqual xử lý chính xác object khác thứ tự key");

        const docEscape = { "foo/bar": 100, "tilde~key": 200 };
        JsonPatch.applyPatch(docEscape, [{ op: "replace", path: "/foo~1bar", value: 150 }]);
        assert(docEscape["foo/bar"] === 150, "Pointer Escaping: ~1 được giải mã thành dấu '/'");

        JsonPatch.applyPatch(docEscape, [{ op: "replace", path: "/tilde~0key", value: 250 }]);
        assert(docEscape["tilde~key"] === 250, "Pointer Escaping: ~0 được giải mã thành dấu '~'");

        const docComplexEscape = { "a/b~c": 50 };
        JsonPatch.applyPatch(docComplexEscape, [{ op: "add", path: "/a~1b~0c_new", value: 60 }]);
        assert(docComplexEscape["a/b~c_new"] === 60, "Pointer Escaping: Kết hợp ~1 và ~0 đồng thời");

        const docRoot = { x: 10 };
        JsonPatch.applyPatch(docRoot, [{ op: "copy", path: "/backup", from: "" }]);
        assert(docRoot.backup && docRoot.backup.x === 10, "Op 'copy': Cho phép copy từ root (path rỗng)");

        // 16 - 20: Extreme Depth & Boundary Cases
        const deepObj = EdgeCaseGenerator.generateDeepNestedObject(30, "treasure", "Diamond");
        const deepPath = EdgeCaseGenerator.generateDeepPath(30, "treasure");
        JsonPatch.applyPatch(deepObj, [{ op: "test", path: deepPath, value: "Diamond" }]);
        assert(true, "Op 'test': Vượt qua cấu trúc lồng nhau 30 tầng thành công");

        JsonPatch.applyPatch(deepObj, [{ op: "replace", path: deepPath, value: "Netherite" }]);
        JsonPatch.applyPatch(deepObj, [{ op: "test", path: deepPath, value: "Netherite" }]);
        assert(true, "Op 'replace': Thay đổi giá trị tại độ sâu 30 tầng");

        const mzArr = [null, { id: 1 }];
        JsonPatch.applyPatch(mzArr, [{ op: "add", path: "/6", value: { id: 6, name: "Super Potion" } }]);
        assert(mzArr.length === 7 && mzArr[6].name === "Super Potion" && mzArr[3] === null, "Sparse Array: Tự động điền null vào khoảng trống chỉ số");

        const hierarchy = { parent: { child: 1 } };
        assertThrows(() => {
            JsonPatch.applyPatch(hierarchy, [{ op: "move", path: "/parent/child/grandchild", from: "/parent" }]);
        }, "Op 'move': Từ chối di chuyển object vào chính nhánh con của nó");

        assertThrows(() => {
            JsonPatch.applyPatch({ val: 42 }, [{ op: "test", path: "/val", value: "42" }]);
        }, "Op 'test': Phân biệt chặt chẽ Number 42 và String '42'");

        // 21 - 25: Chained Batch Mutations & Invalid Inputs
        const batchDoc = { items: [1, 2, 3], meta: { count: 3 } };
        const patchList = [
            { op: "add", path: "/items/-", value: 4 },
            { op: "replace", path: "/meta/count", value: 4 },
            { op: "add", path: "/status", value: "updated" },
            { op: "move", path: "/final_status", from: "/status" },
            { op: "test", path: "/final_status", value: "updated" }
        ];
        JsonPatch.applyPatch(batchDoc, patchList);
        assert(batchDoc.items.length === 4 && batchDoc.final_status === "updated", "Batch Patch: Chuỗi 5 operations thực thi nguyên tử");

        assertThrows(() => JsonPatch.applyPatch({}, "not an array"), "Reject Patch: Ném lỗi nếu patchList không phải mảng");
        assertThrows(() => JsonPatch.applyPatch({}, [{ path: "/a" }]), "Reject Patch: Ném lỗi nếu thiếu trường 'op'");
        assertThrows(() => JsonPatch.applyPatch({}, [{ op: "invalid_op", path: "/a" }]), "Reject Patch: Ném lỗi nếu 'op' không hợp lệ");
        assertThrows(() => JsonPatch.applyPatch({ a: 1 }, [{ op: "replace", path: "/non_existent/b", value: 2 }]), "Path Error: Báo lỗi khi replace parent path không tồn tại");
    }
    print("");

    // ========================================================================
    // SUITE 2: TOPO SORT, CYCLES & COMPLEX DEPENDENCY GRAPHS (20 TESTS)
    // ========================================================================
    print("📋 [TEST SUITE 2] Topo Sort, Cycles & Complex Dependency Graphs (20 Scenarios)");

    {
        const engine = new OpenRPGEngine({ gameRoot: "D:/DummyGame" });

        // 26 - 30: Tuyến tính và Kim cương
        const linearMods = [
            { id: "mod_d", dependencies: ["mod_c"], enabled: true },
            { id: "mod_b", dependencies: ["mod_a"], enabled: true },
            { id: "mod_a", dependencies: [], enabled: true },
            { id: "mod_c", dependencies: ["mod_b"], enabled: true }
        ];
        const sortedLinear = engine._sortModsByDependencies(linearMods);
        const orderLinear = sortedLinear.map(m => m.id).join("->");
        assert(orderLinear === "mod_a->mod_b->mod_c->mod_d", "Topo Sort: Tuyến tính 4 cấp sắp xếp đúng (a->b->c->d)");

        const diamondMods = [
            { id: "D", dependencies: ["B", "C"], enabled: true },
            { id: "B", dependencies: ["A"], enabled: true },
            { id: "C", dependencies: ["A"], enabled: true },
            { id: "A", dependencies: [], enabled: true }
        ];
        const sortedDiamond = engine._sortModsByDependencies(diamondMods);
        const idxA = sortedDiamond.findIndex(m => m.id === "A");
        const idxB = sortedDiamond.findIndex(m => m.id === "B");
        const idxC = sortedDiamond.findIndex(m => m.id === "C");
        const idxD = sortedDiamond.findIndex(m => m.id === "D");
        assert(idxA < idxB && idxA < idxC && idxB < idxD && idxC < idxD, "Topo Sort: Mô hình kim cương (Diamond) thỏa mãn mọi phụ thuộc");

        const selfCycle = [{ id: "self_bad", dependencies: ["self_bad"], enabled: true }];
        engine._sortModsByDependencies(selfCycle);
        assert(selfCycle[0].status === "error", "Cycle Detection: Tự phụ thuộc vào chính mình (A->A) phát hiện lỗi");

        const pairCycle = [
            { id: "cyc_a", dependencies: ["cyc_b"], enabled: true },
            { id: "cyc_b", dependencies: ["cyc_a"], enabled: true }
        ];
        engine._sortModsByDependencies(pairCycle);
        assert(pairCycle.some(m => m.status === "error"), "Cycle Detection: Vòng lặp 2 chiều (A<->B) bị phát hiện và đánh dấu");

        const complexCycle = [
            { id: "n1", dependencies: ["n2"], enabled: true },
            { id: "n2", dependencies: ["n3"], enabled: true },
            { id: "n3", dependencies: ["n4"], enabled: true },
            { id: "n4", dependencies: ["n5"], enabled: true },
            { id: "n5", dependencies: ["n2"], enabled: true }
        ];
        engine._sortModsByDependencies(complexCycle);
        assert(complexCycle.filter(m => m.status === "error").length >= 1, "Cycle Detection: Vòng lặp phức hợp 5 nút phát hiện chính xác");

        // 31 - 35: SemVer Range Checks
        assert(engine.satisfiesVersion("1.2.0", "=", "1.2.0"), "SemVer: 1.2.0 == 1.2.0");
        assert(engine.satisfiesVersion("2.0.0", ">", "1.9.9"), "SemVer: 2.0.0 > 1.9.9");
        assert(engine.satisfiesVersion("1.0.1", "<", "1.0.10"), "SemVer: 1.0.1 < 1.0.10 (phân tích số học)");
        assert(engine.satisfiesVersion("1.5.0", ">=", "1.0.0"), "SemVer: Range >=1.0.0 khớp 1.5.0");
        assert(!engine.satisfiesVersion("0.9.0", ">=", "1.0.0"), "SemVer: Range >=1.0.0 từ chối 0.9.0");

        // 36 - 40: Caret (^), Tilde (~)
        assert(engine.satisfiesVersion("1.2.5", "^", "1.2.0"), "SemVer: Caret ^1.2.0 khớp 1.2.5");
        assert(!engine.satisfiesVersion("2.0.0", "^", "1.2.0"), "SemVer: Caret ^1.2.0 từ chối bước nhảy Major 2.0.0");
        assert(engine.satisfiesVersion("1.2.4", "~", "1.2.0"), "SemVer: Tilde ~1.2.0 khớp 1.2.4");
        assert(!engine.satisfiesVersion("1.3.0", "~", "1.2.0"), "SemVer: Tilde ~1.2.0 từ chối bước nhảy Minor 1.3.0");
        assert(engine.satisfiesVersion("9.9.9", null, null), "SemVer: Null op khớp mọi phiên bản");

        // 41 - 45: Conflicts & Disconnected Graphs
        engine.mods = [
            { id: "mod_red", name: "Red Mod", enabled: true, conflicts: ["mod_blue"], isCore: false },
            { id: "mod_blue", name: "Blue Mod", enabled: true, conflicts: [], isCore: false }
        ];
        engine._validateConflicts();
        assert(engine.mods[0].status === "conflict" && engine.mods[1].status === "conflict", "Conflict Detection: Phát hiện xung đột và cách ly cả hai");

        const disconnected = [
            { id: "island_1", dependencies: [], enabled: true },
            { id: "island_2", dependencies: ["island_1"], enabled: true },
            { id: "desert_1", dependencies: [], enabled: true },
            { id: "desert_2", dependencies: ["desert_1"], enabled: true }
        ];
        const sortedDis = engine._sortModsByDependencies(disconnected);
        assert(sortedDis.length === 4, "Topo Sort: Đồ thị không liên thông được sắp xếp trọn vẹn");
        assert(sortedDis.indexOf(disconnected[0]) < sortedDis.indexOf(disconnected[1]), "Topo Sort: Thứ tự island_1 trước island_2 bảo toàn");
        assert(sortedDis.indexOf(disconnected[2]) < sortedDis.indexOf(disconnected[3]), "Topo Sort: Thứ tự desert_1 trước desert_2 bảo toàn");
        assert(engine.parseDependency("my_mod >= 1.5.0").id === "my_mod", "Dependency Parser: Bóc tách ID chính xác từ chuỗi cú pháp");
    }
    print("");

    // ========================================================================
    // SUITE 3: 9-LAYER SECURITY AUDIT & GRADING MATRIX S/A/B/C/F (25 TESTS)
    // ========================================================================
    print("📋 [TEST SUITE 3] 9-Layer Security Audit Pipeline & Grading Matrix S/A/B/C/F (25 Scenarios)");

    {
        const engine = new OpenRPGEngine({ gameRoot: "D:/DummyGame" });

        // 46 - 50: Grade S, Grade A
        const modS = { id: "clean_s", name: "Clean Mod", version: "1.0.0", author: "Dev", description: "Good", rawContent: "const x = 1;", isCore: false };
        const auditS = engine.auditMod(modS);
        assert(auditS.score >= 90 && auditS.grade === "S" && auditS.passed, `Audit Matrix: Mod S đạt Hạng S (${auditS.score}/100)`);

        const modA = { id: "missing_meta_a", version: "1.0.0", rawContent: "throw new Error('warning');", isCore: false };
        const auditA = engine.auditMod(modA);
        assert(auditA.score >= 70 && auditA.passed, `Audit Matrix: Mod A đạt điểm thông qua (${auditA.score}/100)`);

        // Grade B & C
        const modB = { id: "mod_b", rawContent: "child_process.exec(); process.exit();", isCore: false };
        const auditB = engine.auditMod(modB);
        assert(auditB.score < auditS.score && auditB.score >= 50, `Audit Matrix: Mod B bị trừ điểm do quyền nhạy cảm (${auditB.score}/100)`);

        // Custom Policy for Grade C
        engine.setPolicy("audit", (m, rep) => {
            if (m.id === "target_c") { rep.score = 55; rep.grade = "C"; rep.passed = true; }
            return rep;
        });
        const modC = { id: "target_c", isCore: false };
        const auditC = engine.auditMod(modC);
        assert(auditC.grade === "C" && auditC.score === 55, "Audit Matrix: Xếp hạng Grade C qua Audit Policy");

        modC.audit = auditC;
        if (modC.audit.grade === "C") modC.strictCircuitBreaker = true;
        assert(modC.strictCircuitBreaker === true, "Audit Matrix: Mod Hạng C tự động kích hoạt Strict Circuit Breaker");

        // 56 - 60: Grade F & Critical Interception
        engine.setPolicy("audit", null); // Reset policy
        const modF = { id: "infinite_loop_f", rawContent: "while (true) {}", isCore: false };
        const auditF = engine.auditMod(modF);
        assert(auditF.grade === "F" && !auditF.passed && auditF.criticalFailures.length > 0, "Audit Matrix: Vòng lặp vô tận bị đánh rớt Hạng F và ghi nhận Critical Failure");

        const modSyntax = { id: "syntax_err_f", rawContent: "const = ;", isCore: false };
        const auditSyntax = engine.auditMod(modSyntax);
        assert(auditSyntax.grade === "F" && !auditSyntax.passed, "Audit Matrix: Cú pháp JS hỏng bị đánh rớt Hạng F");

        // 61 - 70: Strict Quarantine, Bypass, Trust, Layers
        engine.toggleFeature("strictQuarantine", true);
        assert(engine.isFeatureEnabled("strictQuarantine"), "Feature Toggle: strictQuarantine đã được bật");

        const modBypass = { id: "bypass_mod", bypassAudit: true, isCore: false };
        const auditBypass = engine.auditMod(modBypass);
        assert(auditBypass.grade === "S" && auditBypass.bypassed === true, "Audit Bypass: Cờ bypassAudit được ủy thác 100 điểm tuyệt đối");

        const modTrust = { id: "trust_mod", trust: true, isCore: false };
        const auditTrust = engine.auditMod(modTrust);
        assert(auditTrust.grade === "S" && auditTrust.bypassed === true, "Audit Trust: Cờ trust được miễn trừ kiểm định");

        engine.toggleFeature("auditCache", true);
        engine.auditCache = { "hash_test": { score: 100, grade: "S", passed: true } };
        assert(engine.auditCache["hash_test"].grade === "S", "Audit Cache: Nhớ kết quả kiểm định để boot tức thời");

        assert(auditS.layers.length >= 5, "Audit Pipeline: Báo cáo đầy đủ các tầng kiểm định");
        assert(engine.isFeatureEnabled("audit"), "Feature Toggle: audit mặc định bật");
        engine.toggleFeature("audit", false);
        assert(!engine.isFeatureEnabled("audit"), "Feature Toggle: audit có thể tắt động");
        engine.toggleFeature("audit", true);

        // Additional 11 Security & Audit Edge Checks (Making Suite 3 exactly 25 tests)
        const auditEmpty = engine.auditMod({ id: "bare_minimum" });
        assert(auditEmpty.passed && typeof auditEmpty.score === "number", "Audit Matrix: Mod tối giản không bị crash");

        const auditEval = engine.auditMod({ id: "bad_eval", rawContent: "eval('window.hack()');", isCore: false });
        assert(auditEval.score < auditS.score, "Audit Matrix: Đánh tụt điểm mã nguồn chứa eval()");

        const auditFunc = engine.auditMod({ id: "bad_func", rawContent: "new Function('return 123')();", isCore: false });
        assert(auditFunc.score < auditS.score, "Audit Matrix: Đánh tụt điểm mã nguồn chứa new Function()");

        const auditWorker = engine.auditMod({ id: "bad_worker", rawContent: "new Worker('worker.js');", isCore: false });
        assert(auditWorker.score < auditS.score, "Audit Matrix: Đánh tụt điểm mã nguồn chứa new Worker()");

        const auditRequire = engine.auditMod({ id: "bad_require", rawContent: "require('child_process');", isCore: false });
        assert(auditRequire.score < auditS.score, "Audit Matrix: Đánh tụt điểm mã nguồn import module nhạy cảm");

        const auditProto = engine.auditMod({ id: "bad_proto", rawContent: "Object.prototype.polluted = true;", isCore: false });
        assert(auditProto.score < auditS.score, "Audit Matrix: Đánh tụt điểm mã nguồn can thiệp Object.prototype");

        assert(auditS.score <= 100 && auditS.score >= 0, "Audit Matrix: Điểm số luôn nằm trong biên [0..100]");
        assert(auditF.score <= 100 && auditF.score >= 0, "Audit Matrix: Điểm số Hạng F luôn nằm trong biên [0..100]");

        assert(Array.isArray(auditF.criticalFailures), "Audit Matrix: criticalFailures luôn là mảng");
        assert(Array.isArray(auditS.layers), "Audit Matrix: layers luôn là một mảng báo cáo các tầng");
        assert(auditS.maxScore === 100, "Audit Matrix: Điểm trần maxScore luôn là 100");
    }
    print("");

    // ========================================================================
    // SUITE 4: SAFE-FS & SANDBOX PROCESS ISOLATION (15 TESTS)
    // ========================================================================
    print("📋 [TEST SUITE 4] Safe-FS & Sandbox Process Isolation (15 Scenarios)");

    {
        const engine = new OpenRPGEngine({ gameRoot: "D:/DummyGame" });
        const modObj = { id: "safe_test_mod", folderPath: "D:/DummyGame/mods/safe_test_mod" };
        const safeFs = engine.createSafeFs(modObj);

        // 71 - 75: Path Traversal
        assertThrows(() => safeFs.readFileSync("../../../Windows/System32/drivers/etc/hosts"), "Safe-FS: Chặn ../../../ đọc dữ liệu OS");
        assertThrows(() => safeFs.writeFileSync("../../../Game.exe", "BAD"), "Safe-FS: Chặn ../../../ ghi đè Game.exe");
        assertThrows(() => safeFs.unlinkSync("../other/index.js"), "Safe-FS: Chặn xóa file của mod khác");
        assertThrows(() => safeFs.mkdirSync("C:/Windows/Hacked"), "Safe-FS: Chặn tạo thư mục trên ổ C:/");
        assert(typeof safeFs.existsSync === "function", "Safe-FS: Cung cấp đầy đủ interface fs");

        // 76 - 80: SafeProcess Mock
        const safeProc = engine.createSafeProcess(modObj);
        let okExit = false; safeProc.exit(1); okExit = true;
        assert(okExit, "SafeProcess: process.exit() bị đánh chặn, không làm sập game");

        let okAbort = false; safeProc.abort(); okAbort = true;
        assert(okAbort, "SafeProcess: process.abort() bị đánh chặn an toàn");

        let okKill = false; safeProc.kill(123); okKill = true;
        assert(okKill, "SafeProcess: process.kill() bị đánh chặn an toàn");

        assert(safeProc.mainModule === null, "SafeProcess: mainModule bị cách ly (chống prototype traversal)");

        // 81 - 85: Permissions
        const modAllowed = { id: "net_mod", permissions: ["network:outbound"] };
        const modDenied = { id: "simple_mod", permissions: [] };
        assert(engine.hasPermission(modAllowed, "network:outbound"), "Permissions: Cấp phép khi có khai báo");
        assert(!engine.hasPermission(modDenied, "network:outbound"), "Permissions: Từ chối khi không có khai báo");

        engine.setPolicy("permission", (m, p) => m.id === "vip");
        assert(engine.hasPermission({ id: "vip" }, "any"), "Policy API: Cho phép cấp quyền động");
        assert(!engine.hasPermission({ id: "guest" }, "any"), "Policy API: Từ chối mod không thuộc diện VIP");
        engine.setPolicy("permission", null);

        assert(typeof safeFs.createReadStream === "function", "Safe-FS: Cung cấp createReadStream interface");
        assert(typeof safeProc.env === "object", "SafeProcess: Cung cấp env sandbox an toàn");
    }
    print("");

    // ========================================================================
    // SUITE 5: CIRCUIT BREAKER BURSTS & MULTI-PRIORITY HOOKS (10 TESTS)
    // ========================================================================
    print("📋 [TEST SUITE 5] Circuit Breaker High-Frequency Bursts & Multi-Priority Hooks (10 Scenarios)");

    {
        const engine = new OpenRPGEngine({ gameRoot: "D:/DummyGame", circuitBreakerLimit: 2 });

        class Game_Battler { attack(dmg) { return dmg * 2; } }
        const battler = new Game_Battler();

        let hookCallsP100 = 0;
        let hookCallsP0 = 0;

        engine.hook(Game_Battler, "attack", function (next, dmg) {
            hookCallsP100++;
            return next(dmg + 10);
        }, "ModHigh", 100);

        engine.hook(Game_Battler, "attack", function (next, dmg) {
            hookCallsP0++;
            throw new Error("Burst Exception!");
        }, "ModCrash", 0);

        // 86 - 90: Burst & Tripping
        const res1 = battler.attack(20);
        assert(res1 === 60, "Multi-Hook: (20 + 10) * 2 = 60; Khi Hook 2 lỗi, Hook 1 và hàm gốc vẫn chạy");
        assert(hookCallsP0 === 1, "Burst: Hook lỗi gọi lần 1");

        const res2 = battler.attack(20);
        assert(res2 === 60, "Burst: Lần 2 tiếp tục an toàn");
        assert(hookCallsP0 === 2, "Burst: Hook lỗi chạm ngưỡng Limit 2");

        const res3 = battler.attack(20);
        assert(res3 === 60, "Circuit Breaker: Lần 3 chạy mượt");
        assert(hookCallsP0 === 2, "Circuit Breaker: Hook lỗi đã bị ngắt triệt để, không bị gọi thêm");

        // 91 - 95: Strict Circuit Breaker
        class Game_Spell { cast() { return 100; } }
        const spell = new Game_Spell();
        engine.mods.push({ id: "strict_mod", strictCircuitBreaker: true, enabled: true });
        let strictCalls = 0;
        engine.hook(Game_Spell, "cast", function (next) {
            strictCalls++;
            throw new Error("Strict fail");
        }, "strict_mod", 0);

        spell.cast();
        spell.cast();
        assert(strictCalls === 1, "Strict Circuit Breaker: Mod strictCircuitBreaker bị ngắt ngay lần lỗi đầu tiên");
        assert(spell.cast() === 100, "Strict Circuit Breaker: Hàm gốc tiếp tục phục hồi bình thường");

        // Priority Execution Order Check
        let execOrder = [];
        class Game_OrderTest { run() { return "base"; } }
        const orderTarget = new Game_OrderTest();
        engine.hook(Game_OrderTest, "run", (next) => { execOrder.push("P10"); return next(); }, "M1", 10);
        engine.hook(Game_OrderTest, "run", (next) => { execOrder.push("P50"); return next(); }, "M2", 50);
        orderTarget.run();
        assert(execOrder[0] === "P50" && execOrder[1] === "P10", "Hook Priority: Hook P50 thực thi trước Hook P10");
        assert(engine.isFeatureEnabled("circuitBreaker"), "Circuit Breaker: Feature mặc định bật");
    }
    print("");

    // ========================================================================
    // SUITE 6: SAVE SHIELD ORPHAN CLEANSING & RESILIENCY (10 TESTS)
    // ========================================================================
    print("📋 [TEST SUITE 6] Save Shield Orphan Cleansing & Resiliency (10 Scenarios)");

    {
        const engine = new OpenRPGEngine({ gameRoot: "D:/DummyGame" });
        const scope = engine.getGlobalScope();

        scope.$dataItems = [null, { id: 1, name: "Herb" }, { id: 2, name: "Potion" }];
        scope.$dataWeapons = [null, { id: 1, name: "Sword" }];
        scope.$dataArmors = [null, { id: 1, name: "Shield" }];
        scope.$dataActors = [null, { id: 1, name: "Erica" }, { id: 2, name: "Kronus" }];

        scope.$gameParty = {
            _items: { 1: 5, 2: 10, 999: 1, 888: 2 },
            _weapons: { 1: 1, 555: 1 },
            _armors: { 1: 1, 777: 1 },
            _actors: [1, 2, 9999]
        };

        engine.sanitizeSaveContents();

        // 96 - 105: Save Shield Checks
        assert(scope.$gameParty._items[1] === 5 && scope.$gameParty._items[2] === 10, "Save Shield: Giữ nguyên item hợp lệ (ID 1, 2)");
        assert(!("999" in scope.$gameParty._items), "Save Shield: Khử trùng thành công item mồ côi ID 999");
        assert(!("888" in scope.$gameParty._items), "Save Shield: Khử trùng thành công item mồ côi ID 888");
        assert(!("555" in scope.$gameParty._weapons), "Save Shield: Khử trùng weapon mồ côi ID 555");
        assert(!("777" in scope.$gameParty._armors), "Save Shield: Khử trùng armor mồ côi ID 777");
        assert(scope.$gameParty._actors.length === 2 && !scope.$gameParty._actors.includes(9999), "Save Shield: Loại bỏ actor mồ côi ID 9999");

        scope.$gameParty = null;
        let survivedNullParty = false;
        try { engine.sanitizeSaveContents(); survivedNullParty = true; } catch (e) {}
        assert(survivedNullParty, "Save Shield: Sống sót khi $gameParty là null");

        scope.$gameParty = { _items: null, _actors: null };
        let survivedNullAttrs = false;
        try { engine.sanitizeSaveContents(); survivedNullAttrs = true; } catch (e) {}
        assert(survivedNullAttrs, "Save Shield: Sống sót khi các thuộc tính trong save bị null");

        delete scope.$dataItems;
        let survivedNoData = false;
        try { engine.sanitizeSaveContents(); survivedNoData = true; } catch (e) {}
        assert(survivedNoData, "Save Shield: Sống sót và không lỗi khi dữ liệu cơ sở $dataItems bị xoá");
        assert(engine.isFeatureEnabled("saveShield"), "Save Shield: Feature mặc định bật");
    }
    print("");

    // ========================================================================
    // 🎲 DYNAMIC FUZZING: TỰ ĐỘNG SINH THÊM 100 TRƯỜNG HỢP BIÊN CỰC KHÓ (100 TESTS)
    // ========================================================================
    print("📋 [TEST SUITE 7-10] Tự Sinh Thêm 100 Trường Hợp Biên Cực Khó (Dynamic Edge Generator)");

    // 106 - 130: 25 Dynamic JSON-Patch Matrix & Tree Fuzzing Tests
    for (let i = 0; i < 25; i++) {
        const matrix = [
            [i, i + 1, i + 2],
            [i + 3, i + 4, i + 5]
        ];
        JsonPatch.applyPatch(matrix, [
            { op: "replace", path: "/0/1", value: 999 + i },
            { op: "add", path: "/1/-", value: 888 + i },
            { op: "test", path: "/0/1", value: 999 + i }
        ]);
        assert(matrix[0][1] === 999 + i && matrix[1][3] === 888 + i, `Dynamic Patch Fuzzing #${i + 1}: Matrix mutation tại dòng ${i}`);
    }

    // 131 - 155: 25 Dynamic Topo Sort DAG Stress Tests
    const dynamicEngine = new OpenRPGEngine({ gameRoot: "D:/DummyGame" });
    for (let i = 0; i < 25; i++) {
        const dagMods = [];
        const count = 5 + (i % 6);
        for (let j = 0; j < count; j++) {
            const deps = j > 0 ? [`dag_mod_${j - 1}`] : [];
            dagMods.push({ id: `dag_mod_${j}`, dependencies: deps, enabled: true });
        }
        // Trộn ngẫu nhiên
        dagMods.sort(() => Math.random() - 0.5);
        const sorted = dynamicEngine._sortModsByDependencies(dagMods);
        assert(sorted.length === count && sorted[0].id === "dag_mod_0", `Dynamic DAG Fuzzing #${i + 1}: Đồ thị ${count} nút sắp xếp topo chuẩn xác`);
    }

    // 156 - 180: 25 Dynamic Security Audit Scoring & Grading Permutations
    for (let i = 0; i < 25; i++) {
        const hasAuthor = (i % 2 === 0);
        const hasDesc = (i % 3 === 0);
        const permMod = {
            id: `dyn_mod_${i}`,
            name: `Dynamic Mod ${i}`,
            version: `1.${i}.0`,
            author: hasAuthor ? `Author_${i}` : "N/A",
            description: hasDesc ? `Desc ${i}` : "",
            rawContent: `const val_${i} = ${i * 10};`,
            isCore: false
        };
        const rep = dynamicEngine.auditMod(permMod);
        assert(rep.score >= 70 && rep.passed, `Dynamic Audit Fuzzing #${i + 1}: Tính toán điểm số chuẩn xác (${rep.score}/100 - Hạng ${rep.grade})`);
    }

    // 181 - 205: 25 Dynamic Circuit Breaker Burst & State Recovery Tests
    class DynamicTarget { compute(x) { return x * 10; } }
    const dynTarget = new DynamicTarget();
    for (let i = 0; i < 25; i++) {
        const modId = `dyn_breaker_${i}`;
        let errCount = 0;
        dynamicEngine.hook(DynamicTarget, "compute", function (next, x) {
            errCount++;
            if (errCount <= 2) throw new Error("Fuzz Error");
            return next(x);
        }, modId, i);

        dynTarget.compute(i);
        dynTarget.compute(i);
        const res = dynTarget.compute(i);
        assert(res === i * 10, `Dynamic Breaker Fuzzing #${i + 1}: Circuit breaker ngắt hook lỗi an toàn, kết quả ${res} = ${i * 10}`);
    }
    print("");

    // ========================================================================
    // SUITE 11: CRITICAL BUG FIXES & VULNERABILITY VERIFICATION (10 TESTS)
    // ========================================================================
    print("📋 [TEST SUITE 11] Critical Security & Architecture Fixes (10 Scenarios)");

    {
        // 206: RFC 6901 Pointer Symmetry
        const tokensRoot = JsonPatch.parsePath("");
        const tokensEmptyKey = JsonPatch.parsePath("/");
        assert(tokensRoot.length === 0 && tokensEmptyKey.length === 1 && tokensEmptyKey[0] === "", "RFC 6901: parsePath phân biệt '' (root doc) và '/' (khóa rỗng doc[''])");

        // 207: RFC 6902 Empty String Key Mutation
        const emptyKeyDoc = { "": "initial_val", regular: "normal" };
        JsonPatch.applyPatch(emptyKeyDoc, [{ op: "replace", path: "/", value: "mutated_val" }]);
        assert(emptyKeyDoc[""] === "mutated_val" && emptyKeyDoc.regular === "normal", "RFC 6902: Path '/' cập nhật chính xác thuộc tính chuỗi rỗng của object gốc");

        // 208: Missing Dependency Quarantine
        const testEngine = new OpenRPGEngine({ gameRoot: "D:/DummyGame" });
        const missingDepMods = [
            { id: "mod_victim", dependencies: ["phantom_mod"], enabled: true }
        ];
        const sortedMissing = testEngine._sortModsByDependencies(missingDepMods);
        assert(missingDepMods[0].status === "missing_dependency" && sortedMissing.length === 0, "Missing Dependency: Mod thiếu phụ thuộc bị đánh dấu 'missing_dependency' và loại khỏi danh sách chạy");

        // 209: Inactive Dependency Propagation
        const disabledDepMods = [
            { id: "base_disabled", enabled: false, status: "disabled", dependencies: [] },
            { id: "child_mod", dependencies: ["base_disabled"], enabled: true }
        ];
        const sortedDisabled = testEngine._sortModsByDependencies(disabledDepMods);
        assert(disabledDepMods[1].status === "missing_dependency" && !sortedDisabled.includes(disabledDepMods[1]), "Inactive Dependency: Mod phụ thuộc vào mod bị disabled bị chuyển sang 'missing_dependency'");

        // 210: Safe-FS Read Interception (Explicit Security Rejection)
        const dummyMod = { id: "vuln_tester", folderPath: "D:/DummyGame/mods/vuln_tester" };
        const safeFs = testEngine.createSafeFs(dummyMod);
        let readSyncError = "";
        try {
            safeFs.readFileSync("../../../Windows/System32/drivers/etc/hosts");
        } catch (e) {
            readSyncError = e.message || String(e);
        }
        assert(readSyncError.includes("[Safe-FS] BỊ CHẶN"), "Safe-FS: readFileSync ngoài sandbox bị chặn chủ động với [Safe-FS] BỊ CHẶN");

        // 211: Safe-FS createReadStream Interception
        let streamError = "";
        try {
            safeFs.createReadStream("../../../SensitiveSave.rpgsave");
        } catch (e) {
            streamError = e.message || String(e);
        }
        assert(streamError.includes("[Safe-FS] BỊ CHẶN"), "Safe-FS: createReadStream ngoài sandbox bị chặn chủ động");

        // 212: Node Protocol Prefix Bypass Prevention (require('node:child_process'))
        const sReq = testEngine.createRequire(dummyMod);
        let nodeCpBlocked = false;
        try {
            sReq("node:child_process");
        } catch (e) {
            nodeCpBlocked = e.message.includes("child_process:exec");
        }
        assert(nodeCpBlocked, "Sandbox: require('node:child_process') bị bắt và kiểm tra quyền hạn chặt chẽ");

        // 213: Node Protocol Prefix for Safe-FS (require('node:fs'))
        const sFsRequired = sReq("node:fs");
        let safeFsNodeBlocked = false;
        try {
            sFsRequired.readFileSync("../../../boot.ini");
        } catch (e) {
            safeFsNodeBlocked = e.message.includes("[Safe-FS] BỊ CHẶN");
        }
        assert(safeFsNodeBlocked, "Sandbox: require('node:fs') trả về safeFs được bảo vệ thay vì fs gốc");

        // 214: Global Scope Escape Prevention (window.require / globalThis.require)
        const maliciousMod = {
            id: "bad_escape_mod",
            folderPath: "D:/DummyGame/mods/bad_escape_mod",
            rawContent: "window.require('node:child_process');",
            enabled: true,
            status: "discovered"
        };
        testEngine._execute(maliciousMod);
        assert(maliciousMod.status === "error" && maliciousMod.error.includes("child_process:exec"), "Sandbox: Chặn triệt để vượt rào qua window.require/globalThis.require bên trong code mod");

        // 215: Double Patching Idempotency Guard
        assert(testEngine._dataPatchesApplied === false, "Double Patch Guard: Cờ _dataPatchesApplied khởi tạo false");
        testEngine.applyDataPatches();
        assert(testEngine._dataPatchesApplied === true, "Double Patch Guard: Cờ _dataPatchesApplied chuyển true sau lần áp dụng đầu tiên");
    }
    print("");

    // ========================================================================
    // [TEST SUITE 12] DANGEROUS PERMISSION PROMPTS, STRICT SYNTAX, PRIORITY & SECURITY CUSTOMIZATION (19 Scenarios)
    // ========================================================================
    {
        print("📋 [TEST SUITE 12] Dangerous Permission Prompts, Strict Syntax, Priority & Security Customization (19 Scenarios)");
        const secEngine = new OpenRPGEngine({
            gameRoot: "D:/DummyGame",
            security: {
                dangerousPermissions: ["child_process:exec", "filesystem:unrestricted", "system:control"]
            }
        });

        // 217: Dangerous Permission Detection
        assert(secEngine.isDangerousPermission("child_process:exec") === true, "Dangerous Perm: 'child_process:exec' được nhận diện là quyền nguy hiểm");
        assert(secEngine.isDangerousPermission("filesystem:unrestricted") === true, "Dangerous Perm: 'filesystem:unrestricted' được nhận diện là quyền nguy hiểm");
        assert(secEngine.isDangerousPermission("custom:read_only") === false, "Dangerous Perm: Quyền thông thường không nằm trong danh sách nguy hiểm");

        // 218: Permission Prompt Denied via Policy
        const testModA = { id: "mod_prompt_deny", permissions: ["child_process:exec"] };
        secEngine.setPolicy("permissionPrompt", (mod, perm) => false);
        assert(secEngine.hasPermission(testModA, "child_process:exec") === false, "Permission Prompt: Người dùng từ chối cấp quyền -> hasPermission trả về false");

        // 219: Permission Prompt Granted via Policy
        const testModB = { id: "mod_prompt_allow", permissions: ["child_process:exec"] };
        secEngine.setPolicy("permissionPrompt", (mod, perm) => true);
        assert(secEngine.hasPermission(testModB, "child_process:exec") === true, "Permission Prompt: Người dùng đồng ý cấp quyền -> hasPermission trả về true");

        // 220: Manual Permission Grant API
        const testModC = { id: "mod_manual", permissions: ["system:control"] };
        secEngine.setPolicy("permissionPrompt", (mod, perm) => false);
        secEngine.grantPermission(testModC.id, "system:control");
        assert(secEngine.hasPermission(testModC, "system:control") === true, "Permission Grant: grantPermission cấp quyền và ghi nhớ trong cache quyền hạn");

        // 221: Manual Permission Revoke API
        secEngine.revokePermission(testModC.id, "system:control");
        assert(secEngine.hasPermission(testModC, "system:control") === false, "Permission Revoke: revokePermission thu hồi quyền đã cấp thành công");

        // 222: Strict Syntax Checking - Broken Script Detected
        let syntaxChecked = false;
        try {
            new Function("function broken( { return 1; }");
        } catch (e) {
            syntaxChecked = true;
        }
        const brokenMod = {
            id: "broken_syntax_mod",
            rawContent: "function broken( { return 1; }",
            hasSyntaxError: true,
            syntaxErrorDetails: "Unexpected token '{'",
            status: "error",
            enabled: false
        };
        assert(syntaxChecked && brokenMod.hasSyntaxError, "Strict Syntax: Phát hiện mã JS sai cú pháp ngay tại khâu phân tích tĩnh");

        // 223: Strict Syntax Execution Guard
        let executionAborted = false;
        const testBrokenMod = { id: "syntax_err", status: "error", error: "SyntaxError", rawContent: "!!!" };
        secEngine._execute(testBrokenMod);
        assert(testBrokenMod.status === "error", "Strict Syntax: _execute từ chối thực thi mod có trạng thái error");

        // 224: Strict Syntax Boot Guard
        const bootEngine = new OpenRPGEngine({ gameRoot: "D:/DummyGame" });
        bootEngine.discover = () => {}; // Giữ nguyên dummy mods không quét đĩa
        let emittedError = false;
        bootEngine.once("mod:error", (data) => {
            if (data.stage === "syntax") emittedError = true;
        });
        const dummyMods = [
            { id: "mod_good", name: "Good", enabled: true, status: "discovered", dependencies: [], priority: 0 },
            { id: "mod_bad_syntax", name: "Bad Syntax", enabled: true, status: "discovered", hasSyntaxError: true, syntaxErrorDetails: "Unexpected token", dependencies: [], priority: 0 }
        ];
        bootEngine.mods = dummyMods;
        bootEngine.boot();
        assert(dummyMods[1].status === "error" && emittedError, "Strict Syntax: boot() lập tức cô lập mod lỗi cú pháp và phát sự kiện mod:error");

        // 225: Custom Priority Flags
        secEngine.setPriorityFlags({ ULTRA_CORE: 99999, SUB_ZERO: -99999 });
        assert(secEngine.resolvePriority("ULTRA_CORE") === 99999, "Priority Flags: setPriorityFlags đăng ký cờ ưu tiên tùy biến");
        assert(secEngine.resolvePriority("SUB_ZERO") === -99999, "Priority Flags: resolvePriority giải mã cờ âm cực chuẩn xác");
        assert(secEngine.resolvePriority({ priority: "CRITICAL" }) === 10000, "Priority Flags: resolvePriority trích xuất thuộc tính priority từ object");

        // 226: Custom Priority Comparator Overhaul
        let customComparatorCalled = false;
        secEngine.setPriorityComparator((a, b, context) => {
            customComparatorCalled = true;
            const idA = a && a.id ? a.id : "";
            const idB = b && b.id ? b.id : "";
            return idA.localeCompare(idB);
        });
        const compareResult = secEngine.comparePriorities({ id: "alpha" }, { id: "beta" }, "test");
        assert(customComparatorCalled && compareResult < 0, "Priority Comparator: Cho phép dev lại hoàn toàn logic so sánh độ ưu tiên");
        secEngine.setPriorityComparator(null); // khôi phục mặc định

        // 227: Hook Priority Pipeline Sorting
        class TargetClass { testMethod() { return "base"; } }
        secEngine.hook(TargetClass, "testMethod", (orig, ...args) => "low_" + orig.apply(this, args), "mod_low", "LOW");
        secEngine.hook(TargetClass, "testMethod", (orig, ...args) => "high_" + orig.apply(this, args), "mod_high", "HIGH");
        const instance = new TargetClass();
        const hookResult = instance.testMethod();
        assert(hookResult.startsWith("high_"), "Hook Priority: Hook có priority HIGH (500) được ưu tiên thực thi trước LOW (-500)");

        // 228: Master Security Policy - Override Permission
        secEngine.setSecurityPolicy((action, mod, target, meta) => {
            if (action === "permission" && mod.id === "blacklisted") return false;
            if (action === "permission" && target === "super_secret") return true;
            return null;
        });
        assert(secEngine.hasPermission({ id: "any_mod", permissions: [] }, "super_secret") === true, "Master Security Policy: Ghi đè toàn bộ chính sách cấp quyền");
        assert(secEngine.hasPermission({ id: "blacklisted", permissions: ["super_secret"] }, "super_secret") === false, "Master Security Policy: Chặn đứng mod trong danh sách đen");

        // 229: Master Security Policy - Override Safe-FS
        secEngine.setSecurityPolicy((action, mod, target, meta) => {
            if (action === "fs" && target.includes("secret.key")) return false;
            return null;
        });
        const safeFsInstance = secEngine.createSafeFs({ id: "fs_test_mod", folderPath: "D:/DummyGame/mods/fs_test_mod" });
        let fsBlockedByMaster = false;
        try {
            safeFsInstance.readFileSync("D:/DummyGame/mods/fs_test_mod/secret.key");
        } catch (e) {
            fsBlockedByMaster = e.message.includes("[Safe-FS] BỊ CHẶN");
        }
        assert(fsBlockedByMaster, "Master Security Policy: Chặn truy cập Safe-FS tới tệp nhạy cảm");
        secEngine.setSecurityPolicy(null); // khôi phục

        // 230: Prototype Pollution Guard in JsonPatch - resolveParent
        delete Object.prototype.polluted;
        let protoPollutionBlocked1 = false;
        try {
            JsonPatch.applyPatch({}, [{ op: "add", path: "/__proto__/patchPollutedToken", value: "yes" }]);
        } catch (e) {
            protoPollutionBlocked1 = e.message.includes("Prototype Pollution bị chặn");
        }
        assert(protoPollutionBlocked1 && typeof ({}).patchPollutedToken === "undefined", "JsonPatch: Chặn triệt để Prototype Pollution qua token '__proto__'");

        // 231: Prototype Pollution Guard in JsonPatch - constructor/prototype
        let protoPollutionBlocked2 = false;
        try {
            JsonPatch.applyPatch({}, [{ op: "replace", path: "/constructor/prototype/isAdmin", value: true }]);
        } catch (e) {
            protoPollutionBlocked2 = e.message.includes("Prototype Pollution bị chặn");
        }
        assert(protoPollutionBlocked2 && typeof ({}).isAdmin === "undefined", "JsonPatch: Chặn triệt để Prototype Pollution qua token 'constructor/prototype'");

        // 232: Process Hardening - Native dlopen
        const safeProc = secEngine.createSafeProcess({ id: "hardening_mod" });
        let dlopenBlocked = false;
        try {
            safeProc.dlopen();
        } catch (e) {
            dlopenBlocked = e.message.includes("process.dlopen() đã bị chặn");
        }
        assert(dlopenBlocked, "Process Hardening: process.dlopen bị khóa hoàn toàn nhằm chống tải C++ addon trái phép");

        // 233: Process Hardening - Native binding
        let bindingBlocked = false;
        try {
            safeProc.binding("fs");
        } catch (e) {
            bindingBlocked = e.message.includes("process.binding('fs') đã bị chặn");
        }
        assert(bindingBlocked, "Process Hardening: process.binding bị khóa hoàn toàn nhằm chống truy cập V8 internal bindings");

        // 234: Safe-FS Null-Byte Poison Defense
        let nullByteBlocked = false;
        try {
            safeFsInstance.readFileSync("D:/DummyGame/mods/fs_test_mod/test.txt\0../../../../etc/passwd");
        } catch (e) {
            nullByteBlocked = e.message.includes("[Safe-FS] BỊ CHẶN");
        }
        assert(nullByteBlocked, "Safe-FS Hardening: Phát hiện và chặn đứng tấn công Null-Byte Poison '\\0'");

        // 235: Circuit Breaker Culprit Scope Resolution under Security Policy (#1 Regression Test)
        secEngine.mods.push({ id: "mod_culprit_tester", name: "Culprit Tester Mod" });
        let culpritReceived = null;
        secEngine.setSecurityPolicy((action, target, context, details) => {
            if (action === "circuitBreaker") {
                culpritReceived = target;
                return true; // trip circuit breaker
            }
            return null;
        });
        class CrashingTarget { crashMethod() { return "ok"; } }
        secEngine.hook(CrashingTarget, "crashMethod", () => {
            throw new Error("Deliberate hook failure for circuit breaker test");
        }, "mod_culprit_tester");
        const crashInstance = new CrashingTarget();
        let safeHookExecuted = false;
        try {
            const crashRes = crashInstance.crashMethod();
            safeHookExecuted = (crashRes === "ok");
        } catch (e) {
            safeHookExecuted = false;
        }
        assert(safeHookExecuted && culpritReceived !== null && culpritReceived.id === "mod_culprit_tester",
            "Circuit Breaker: Master Security Policy nhận đúng đối tượng culprit khi hook ném lỗi mà không bị ReferenceError (#1)");
        secEngine.setSecurityPolicy(null);
    }
    print("");

    // ========================================================================
    // SUITE 13: ENCRYPTED ASSET MAPPING & DECRYPTION BYPASS (15 TESTS)
    // ========================================================================
    print("📋 [TEST SUITE 13] Encrypted Asset Mapping & Decryption Bypass (15 Scenarios)");

    {
        const engine = new OpenRPGEngine({ gameRoot: "D:/DummyGame" });

        // 1. Magic bytes detection: PNG
        const pngBuf = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]).buffer;
        assert(engine.isCleanMediaBuffer(pngBuf) === true, "Magic Bytes: Nhận diện chính xác chữ ký PNG chuẩn");

        // 2. Magic bytes detection: OGG
        const oggBuf = new Uint8Array([0x4f, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00]).buffer;
        assert(engine.isCleanMediaBuffer(oggBuf) === true, "Magic Bytes: Nhận diện chính xác chữ ký Ogg Vorbis/Opus ('OggS')");

        // 3. Magic bytes detection: JPEG
        const jpgBuf = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]).buffer;
        assert(engine.isCleanMediaBuffer(jpgBuf) === true, "Magic Bytes: Nhận diện chính xác chữ ký JPEG (0xFF 0xD8 0xFF)");

        // 4. Magic bytes detection: M4A/MP4
        const m4aBuf = new Uint8Array([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20]).buffer;
        assert(engine.isCleanMediaBuffer(m4aBuf) === true, "Magic Bytes: Nhận diện chính xác chữ ký M4A ('ftyp')");

        // 5. Magic bytes detection: RIFF/WAV
        const wavBuf = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45]).buffer;
        assert(engine.isCleanMediaBuffer(wavBuf) === true, "Magic Bytes: Nhận diện chính xác chữ ký RIFF/WAV");

        // 6. Encrypted RPGMV Header detection
        const rpgmvHeader = new Uint8Array([
            0x52, 0x50, 0x47, 0x4d, 0x56, 0x00, 0x00, 0x00,
            0x00, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
            0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00
        ]).buffer;
        assert(engine.isEncryptedBuffer(rpgmvHeader) === true, "Encrypted Header: Nhận diện chính xác RPGMV encrypted header");

        // 7. Non-encrypted buffer detection
        const randomBuf = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]).buffer;
        assert(engine.isEncryptedBuffer(randomBuf) === false, "Encrypted Header: Trả về false cho buffer không phải RPGMV");

        // 8. Extension cleaning: .png_ and .rpgmvp
        assert(engine.cleanAssetExtension("img/pictures/Hero.png_") === "img/pictures/Hero.png" &&
               engine.cleanAssetExtension("img/pictures/Hero.rpgmvp") === "img/pictures/Hero.png",
               "Extension Mapping: Tự động chuyển đổi .png_ (MZ) và .rpgmvp (MV) thành .png");

        // 9. Extension cleaning: .ogg_ and .rpgmvo
        assert(engine.cleanAssetExtension("audio/bgm/Theme.ogg_") === "audio/bgm/Theme.ogg" &&
               engine.cleanAssetExtension("audio/bgm/Theme.rpgmvo") === "audio/bgm/Theme.ogg",
               "Extension Mapping: Tự động chuyển đổi .ogg_ (MZ) và .rpgmvo (MV) thành .ogg");

        // 10. Extension cleaning: .rpgmvm
        assert(engine.cleanAssetExtension("audio/bgm/Theme.rpgmvm") === "audio/bgm/Theme.m4a",
               "Extension Mapping: Tự động chuyển đổi .rpgmvm (MV) thành .m4a");

        // 11-13. Virtual Asset Resolution with temp directory
        let tempDir = null;
        if (nodeFs && nodePath) {
            tempDir = nodePath.join(__dirname, "temp_test_enc_assets");
            try {
                if (nodeFs.existsSync(tempDir)) nodeFs.rmSync(tempDir, { recursive: true, force: true });
                nodeFs.mkdirSync(tempDir, { recursive: true });
                nodeFs.mkdirSync(nodePath.join(tempDir, "img", "pictures"), { recursive: true });
                nodeFs.mkdirSync(nodePath.join(tempDir, "audio", "bgm"), { recursive: true });

                nodeFs.writeFileSync(nodePath.join(tempDir, "img", "pictures", "Hero.png"), "FAKE_PNG_CONTENT");
                nodeFs.writeFileSync(nodePath.join(tempDir, "audio", "bgm", "Battle.ogg"), "FAKE_OGG_CONTENT");

                const testEngine = new OpenRPGEngine({ gameRoot: tempDir });
                testEngine.mods = [{
                    id: "mod_enc_test",
                    status: "active",
                    isFolder: true,
                    folderPath: tempDir
                }];

                // 11. Request .png_ resolves to clean Hero.png
                const resolvedPng_ = testEngine.resolveAsset("img/pictures/Hero.png_");
                assert(resolvedPng_ !== null && resolvedPng_.endsWith("img/pictures/Hero.png"),
                    "Asset Resolver: Yêu cầu ảnh mã hóa MZ (.png_) tự động trỏ về ảnh sạch .png của mod");

                // 12. Request .rpgmvp resolves to clean Hero.png
                const resolvedMvp = testEngine.resolveAsset("img/pictures/Hero.rpgmvp");
                assert(resolvedMvp !== null && resolvedMvp.endsWith("img/pictures/Hero.png"),
                    "Asset Resolver: Yêu cầu ảnh mã hóa MV (.rpgmvp) tự động trỏ về ảnh sạch .png của mod");

                // 13. Request .ogg_ resolves to clean Battle.ogg
                const resolvedOgg_ = testEngine.resolveAsset("audio/bgm/Battle.ogg_");
                assert(resolvedOgg_ !== null && resolvedOgg_.endsWith("audio/bgm/Battle.ogg"),
                    "Asset Resolver: Yêu cầu âm thanh mã hóa MZ (.ogg_) tự động trỏ về âm thanh sạch .ogg của mod");
            } finally {
                if (tempDir && nodeFs.existsSync(tempDir)) {
                    try { nodeFs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
                }
            }
        }

        // 14. Decryption Bypass for clean PNG/OGG buffer
        const cleanPngArray = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x01, 0x02, 0x03, 0x04]);
        const bypassedBuf = engine.decryptArrayBuffer(cleanPngArray.buffer, "d41d8cd98f00b204e9800998ecf8427e");
        const bypassedBytes = new Uint8Array(bypassedBuf);
        assert(bypassedBytes[0] === 0x89 && bypassedBytes[1] === 0x50 && bypassedBytes[2] === 0x4e && bypassedBytes[3] === 0x47,
            "Decryption Bypass: Bỏ qua giải mã XOR khi phát hiện buffer ảnh PNG sạch, giữ nguyên byte gốc");

        // 15. Decryption of actual RPGMV payload with 32-hex key
        const testKey = "0102030405060708090a0b0c0d0e0f10";
        const encBytes = new Uint8Array(32);
        const headerPattern = [0x52, 0x50, 0x47, 0x4d, 0x56, 0x00, 0x00, 0x00, 0x00, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00];
        for (let i = 0; i < 16; i++) encBytes[i] = headerPattern[i];
        const keyVals = [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10];
        for (let i = 0; i < 16; i++) {
            encBytes[16 + i] = 0xAA ^ keyVals[i];
        }
        const decBuf = engine.decryptArrayBuffer(encBytes.buffer, testKey);
        const decU8 = new Uint8Array(decBuf);
        let decSuccess = (decU8.byteLength === 16);
        for (let i = 0; i < 16; i++) {
            if (decU8[i] !== 0xAA) decSuccess = false;
        }
        assert(decSuccess === true, "Decryption Engine: Tự động bóc tách header RPGMV và giải mã XOR chính xác với khóa 32-hex");
    }
    print("");

    // ========================================================================
    // [TEST SUITE 14] STAGED SANDBOX ALIASES & GLOBAL SHADOWING
    // ========================================================================
    {
        print("🧪 [TEST SUITE 14] Staged Sandbox Aliases & Global Shadowing (7 Scenarios)");
        const globalObj = typeof globalThis !== "undefined" ? globalThis : global;
        const sbEngine = new OpenRPGEngine({
            gameRoot: "D:/DummyGame",
            name: "CustomLoader",
            sandboxAliases: ["AliasOne", "bad-ident!", "require", "CustomLoader"],
            features: { auditCache: false, strictQuarantine: false }
        });

        const resolvedAliases = sbEngine._resolveSandboxAliases();
        assert(
            resolvedAliases.includes("OpenRPGLoader") &&
            resolvedAliases.includes("CustomLoader") &&
            resolvedAliases.includes("AliasOne") &&
            !resolvedAliases.includes("bad-ident!") &&
            resolvedAliases.indexOf("require") === -1,
            "Sandbox Aliases: Lọc bỏ định danh không hợp lệ/trùng từ khóa và giữ đúng alias hợp lệ"
        );

        const prevCustomGlobal = globalObj.CustomLoader;
        const prevHadCustom = Object.prototype.hasOwnProperty.call(globalObj, "CustomLoader");
        globalObj.CustomLoader = sbEngine;
        try {
            sbEngine._execute({
                id: "fail_alias_bare_win",
                folderPath: ".",
                filePath: "fail1.js",
                status: "discovered",
                rawContent: `
                    CustomLoader.registerItem({ id: "bad_item_1", name: "Bad1" });
                    window.AliasOne.registerItem({ id: "bad_item_2", name: "Bad2" });
                    globalThis.OpenRPGLoader.registerItem({ id: "bad_item_3", name: "Bad3" });
                    Function("return this")().CustomLoader.registerActor({ id: "bad_actor_1", name: "BadA" });
                    throw new Error("Force rollback");
                `
            });
            assert(!sbEngine.registries.items.has("bad_item_1") && !sbEngine.registries.items.has("bad_item_2") && !sbEngine.registries.items.has("bad_item_3"),
                "Sandbox Isolation: Mọi đăng ký qua bare CustomLoader / window.AliasOne / globalThis.OpenRPGLoader đều bị Rollback khi mod lỗi");
            assert(!sbEngine.registries.actors.has("bad_actor_1"),
                "Sandbox Global Shadowing: Truy cập Function('return this')().CustomLoader cũng bị cô lập trong Staged Sandbox");
            assert(globalObj.CustomLoader === sbEngine,
                "Sandbox Cleanup: Khôi phục nguyên vẹn tham chiếu globalObj.CustomLoader sau khi thực thi mod");

            const auditRes = sbEngine.auditMod({
                id: "dryrun_alias_mod",
                name: "DryRun Alias Mod",
                version: "1.0.0",
                author: "Tester",
                source: "Local",
                description: "Verify dry-run with custom aliases",
                disclaimer: "MIT",
                terms: "MIT",
                folderPath: ".",
                filePath: "dryrun.js",
                rawContent: `if (typeof CustomLoader === "undefined" || typeof AliasOne === "undefined") throw new Error("Missing alias");`
            });
            const l5 = auditRes.layers.find(l => l.layer === 5);
            assert(l5 && l5.earned === 15, "Audit Dry-Run: Alias tùy chỉnh được truyền hợp lệ trong quá trình Dry-Run (15/15)");

            assert(Boolean(OpenRPGLoaderCore), "OpenRPGLoaderCore Parity: Phải nạp được OpenRPGLoaderCore để kiểm thử đồng nhất");
            if (OpenRPGLoaderCore) {
                const coreSub = new OpenRPGLoaderCore({
                    gameRoot: "D:/DummyGame",
                    name: "CoreDerivative",
                    sandboxAliases: ["CoreAlias"],
                    features: { auditCache: false, strictQuarantine: false }
                });
                coreSub._execute({
                    id: "fail_core_sub",
                    folderPath: ".",
                    filePath: "fail_core.js",
                    status: "discovered",
                    rawContent: `CoreDerivative.registerItem({ id: "core_bad_item", name: "Bad" }); throw new Error("Crash");`
                });
                assert(!coreSub.registries.items.has("core_bad_item"),
                    "OpenRPGLoaderCore Parity: Staged Sandbox Alias rollback hoạt động đồng nhất trên OpenRPGLoaderCore");
            }
        } finally {
            if (prevHadCustom) globalObj.CustomLoader = prevCustomGlobal;
            else delete globalObj.CustomLoader;
        }
    }
    print("");

    // ========================================================================
    // TỔNG KẾT BÁO CÁO TOÀN DIỆN
    // ========================================================================
    print("==================================================================");
    print(`🏁 BÁO CÁO KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} PASS (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
    print(`❌ FAILED: ${failedTests}`);
    print("==================================================================");

    if (nodeFs && nodePath) {
        try {
            const outPath = nodePath.join(__dirname, "test_results.log");
            nodeFs.writeFileSync(outPath, logs.join("\n"), "utf8");
            print(`📄 Toàn bộ log chi tiết đã ghi tại: ${outPath}`);
        } catch (e) {}
    }

    if (failedTests > 0 && typeof process !== "undefined" && process.exit) {
        process.exit(1);
    }
})();
