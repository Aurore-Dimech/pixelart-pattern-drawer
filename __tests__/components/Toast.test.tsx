import { render, screen, act } from "@testing-library/react";
import { ToastProvider, useToast } from "@/components/ui/Toast";

function TriggerButton({ message = "Test", type = "success" }: { message?: string; type?: "success" | "error" }) {
  const { toast } = useToast();
  return <button onClick={() => toast(message, type)}>Trigger</button>;
}

describe("ToastProvider", () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { act(() => { jest.runAllTimers(); }); jest.useRealTimers(); });

  it("renders children without any toast initially", () => {
    render(
      <ToastProvider>
        <div>content</div>
      </ToastProvider>
    );
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("displays a success toast after calling toast()", () => {
    render(
      <ToastProvider>
        <TriggerButton message="Sauvegardé !" />
      </ToastProvider>
    );
    act(() => { screen.getByRole("button").click(); });
    expect(screen.getByRole("status")).toHaveTextContent("Sauvegardé !");
  });

  it("uses role=alert for error toasts", () => {
    render(
      <ToastProvider>
        <TriggerButton message="Erreur !" type="error" />
      </ToastProvider>
    );
    act(() => { screen.getByRole("button").click(); });
    expect(screen.getByRole("alert")).toHaveTextContent("Erreur !");
  });

  it("dismisses the toast after 3 seconds", () => {
    render(
      <ToastProvider>
        <TriggerButton message="Bye" />
      </ToastProvider>
    );
    act(() => { screen.getByRole("button").click(); });
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(3000); });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("two rapid toasts have distinct DOM nodes (unique IDs)", () => {
    render(
      <ToastProvider>
        <TriggerButton message="First" />
      </ToastProvider>
    );
    const btn = screen.getByRole("button");
    act(() => { btn.click(); jest.advanceTimersByTime(1); btn.click(); });
    // Two status toasts must exist with different text or at least both present
    const toasts = screen.getAllByRole("status");
    expect(toasts).toHaveLength(2);
  });
});
