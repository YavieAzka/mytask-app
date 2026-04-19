"use client";

import { useState, useEffect } from "react";
import {
  getTasks,
  addTask,
  toggleTask,
  deleteTask,
  changeToken,
  getUserSettings,
  updateTitle,
  updateTask,
} from "@/app/action";

type Task = {
  id: string;
  title: string;
  detail?: string | null;
  deadline: Date;
  isCompleted: boolean;
};

export default function TaskManager() {
  const [token, setToken] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [title, setTitle] = useState("Tugas Saya");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDetail, setEditDetail] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("task_token");
    if (savedToken) {
      setToken(savedToken);
      fetchTasks(savedToken);
      fetchSettings(savedToken);
    }
  }, []);

  const fetchTasks = async (currentToken: string) => {
    const data = await getTasks(currentToken);
    setTasks(data);
  };

  const fetchSettings = async (currentToken: string) => {
    const settings = await getUserSettings(currentToken);
    setTitle(settings.title);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    localStorage.setItem("task_token", inputToken);
    setToken(inputToken);
    fetchTasks(inputToken);
    fetchSettings(inputToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("task_token");
    setToken(null);
    setTasks([]);
    setIsRenaming(false);
    setTitle("Tugas Saya");
  };

  const handleUpdateTitle = async () => {
    if (!token || !newTitle.trim() || newTitle === title) {
      setIsEditingTitle(false);
      return;
    }
    await updateTitle(token, newTitle.trim());
    setTitle(newTitle.trim());
    setIsEditingTitle(false);
  };

  const handleUpdateTask = async (id: string) => {
    if (!editTitle.trim() || !editDeadline) return;
    await updateTask(id, editTitle, editDetail, editDeadline);
    setEditingTaskId(null);
    if (token) fetchTasks(token);
  };

  const handleChangeToken = async () => {
    if (!token || !newTokenName.trim() || newTokenName === token) {
      setIsRenaming(false);
      return;
    }

    const result = await changeToken(token, newTokenName.trim());
    if (result.success) {
      localStorage.setItem("task_token", newTokenName.trim());
      setToken(newTokenName.trim());
      setIsRenaming(false);
      fetchTasks(newTokenName.trim());
      fetchSettings(newTokenName.trim());
    } else {
      alert(result.message);
    }
  };

  const calculateDaysLeft = (deadline: Date) => {
    const diffTime = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getIndicatorColor = (daysLeft: number, isCompleted: boolean) => {
    if (isCompleted) return "bg-gray-800 text-gray-500 border-gray-700";
    if (daysLeft < 0) return "bg-red-950 text-red-500 border-red-900";
    if (daysLeft <= 2) return "bg-orange-950 text-orange-400 border-orange-900";
    if (daysLeft <= 5) return "bg-yellow-950 text-yellow-400 border-yellow-900";
    return "bg-zinc-900 text-zinc-300 border-zinc-800";
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4 p-8 border border-zinc-800 rounded-xl bg-zinc-950 w-full max-w-sm"
        >
          <h1 className="text-xl font-bold">The Simplest Task Manager Ever</h1>
          <p className="text-sm text-zinc-400">
            Masukkan token rahasia untuk akses.
          </p>
          <input
            type="text"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="Misal: i-love-furina"
            className="p-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            className="bg-white text-black py-2 rounded font-semibold hover:bg-zinc-200"
          >
            Masuk
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-2xl font-bold bg-zinc-900 border border-zinc-700 rounded px-2 py-1 focus:outline-none focus:border-white"
                  autoFocus
                />
                <button
                  onClick={handleUpdateTitle}
                  className="text-xs bg-white text-black px-2 py-1 rounded hover:bg-zinc-200"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
              </div>
            ) : (
              <h1
                className="text-2xl font-bold cursor-pointer hover:text-zinc-300 transition-colors"
                onClick={() => {
                  setNewTitle(title);
                  setIsEditingTitle(true);
                }}
                title="Klik untuk mengubah judul"
              >
                {title}
              </h1>
            )}
            {isRenaming ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-sm font-mono focus:outline-none focus:border-white"
                  autoFocus
                />
                <button
                  onClick={handleChangeToken}
                  className="text-xs bg-white text-black px-2 py-1 rounded hover:bg-zinc-200"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setIsRenaming(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-zinc-400 font-mono">
                  Token: {token}
                </p>
                <button
                  onClick={() => {
                    setNewTokenName(token || "");
                    setIsRenaming(true);
                  }}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-tighter"
                >
                  [ Ganti ]
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Keluar
          </button>
        </div>

        <form
          action={async (formData) => {
            await addTask(token, formData);
            fetchTasks(token);
            // Reset form
            const form = document.querySelector("form") as HTMLFormElement;
            if (form) form.reset();
          }}
          // Ubah form menjadi flex-col agar isinya (input row & tombol) bertumpuk atas-bawah
          className="flex flex-col gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800"
        >
          {/* Kontainer Input - Sebaris di desktop, bertumpuk di mobile */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch w-full">
            <div className="flex-1 w-full flex flex-col gap-1">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">
                Nama Tugas
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="Apa yang harus dikerjakan?"
                className="p-2 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-zinc-600 h-[42px]"
              />
            </div>

            <div className="flex-1 w-full flex flex-col gap-1">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">
                Detail / Link
              </label>
              <input
                type="text"
                name="detail"
                placeholder="Link spek atau catatan tambahan"
                className="p-2 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-zinc-600 h-[42px]"
              />
            </div>

            <div className="flex flex-col gap-1 md:w-auto w-full">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                required
                className="p-2 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-zinc-600 [color-scheme:dark] h-[42px]"
              />
            </div>
          </div>

          {/* Tombol Tambah diletakkan di bawah */}
          <button
            type="submit"
            className="w-full bg-zinc-100 text-black px-6 py-2.5 rounded font-bold hover:bg-white transition-colors"
          >
            Tambah Tugas
          </button>
        </form>

        <div className="space-y-2">
          {tasks.map((task) => {
            const daysLeft = calculateDaysLeft(task.deadline);
            const isOverdue = daysLeft < 0 && !task.isCompleted;
            const isEditing = editingTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`flex flex-col p-4 rounded-lg border transition-all ${getIndicatorColor(daysLeft, task.isCompleted)}`}
              >
                {isEditing ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-500 uppercase">
                          Judul
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 focus:outline-none focus:border-white"
                          autoFocus
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-500 uppercase">
                          Deadline
                        </label>
                        <input
                          type="date"
                          value={editDeadline}
                          onChange={(e) => setEditDeadline(e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 focus:outline-none focus:border-white [color-scheme:dark]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 uppercase">
                        Detail / Link
                      </label>
                      <input
                        type="text"
                        value={editDetail}
                        onChange={(e) => setEditDetail(e.target.value)}
                        placeholder="Link spesifikasi atau detail lainnya"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 focus:outline-none focus:border-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleUpdateTask(task.id)}
                        className="bg-white text-black px-4 py-1 rounded text-sm font-bold"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="text-zinc-400 hover:text-white text-sm"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={async () => {
                          await toggleTask(task.id, task.isCompleted);
                          fetchTasks(token);
                        }}
                        className="w-5 h-5 mt-1 accent-white cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span
                          className={`font-medium ${task.isCompleted ? "line-through opacity-50" : ""}`}
                        >
                          {task.title}
                        </span>
                        {task.detail && (
                          <div className="mt-1">
                            {task.detail.startsWith("http") ? (
                              <a
                                href={task.detail}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                              >
                                🔗 Spek Tugas
                              </a>
                            ) : (
                              <p className="text-xs text-zinc-500 italic">
                                {task.detail}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 text-sm font-mono">
                      <div className="flex flex-col items-end">
                        <span className={task.isCompleted ? "opacity-50" : ""}>
                          {new Date(task.deadline).toLocaleDateString("id-ID", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span
                          className={`text-xs ${isOverdue ? "text-red-500 font-bold" : "text-zinc-500"}`}
                        >
                          {task.isCompleted
                            ? "Selesai"
                            : daysLeft === 0
                              ? "Hari ini"
                              : isOverdue
                                ? "Terlewat"
                                : `${daysLeft} hari lagi`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditingTaskId(task.id);
                            setEditTitle(task.title);
                            setEditDetail(task.detail || "");
                            setEditDeadline(
                              new Date(task.deadline)
                                .toISOString()
                                .split("T")[0],
                            );
                          }}
                          className="opacity-50 hover:opacity-100 text-zinc-400 hover:text-white transition-opacity"
                          title="Edit tugas"
                        >
                          ✎
                        </button>
                        <button
                          onClick={async () => {
                            await deleteTask(task.id);
                            fetchTasks(token);
                          }}
                          className="opacity-50 hover:opacity-100 text-red-500 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="text-center text-zinc-600 py-12 border border-dashed border-zinc-800 rounded-lg">
              Belum ada tugas. Santai dulu!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
