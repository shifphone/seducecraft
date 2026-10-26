import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

export default function UIDemo() {
  const [value, setValue] = useState([4])

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <h1 className="text-2xl font-bold mb-8">shadcn/ui Variants — Seducecraft</h1>

      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section className="mb-12 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Slider (n images)</h2>
        <div className="space-y-4">
          <Slider value={value} onValueChange={setValue} max={8} step={1} />
          <p className="text-sm text-muted-foreground">n: {value[0]}</p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Model Selector Style</h2>
        <div className="flex gap-2">
          <Button variant={true ? "default" : "outline"}>xSD</Button>
          <Button variant="outline">xSD Pro</Button>
        </div>
      </section>
    </div>
  )
}
