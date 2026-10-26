import {
  Alternatives,
  Bullets,
  Code,
  DocRef,
  DocSection,
  Item,
  Prose,
  Sources,
} from '@/components/doc'
import {
  FigArrow,
  FigChips,
  FigNode,
  FigSvg,
  Figure,
} from '@/components/figure'

export const meta = {
  title: 'kintai は非同期で構成し、tokio と reqwest を使う',
  lead: 'kintai を非同期で構成し、ランタイムに tokio を、HTTP クライアントに reqwest を使うという決定を記録する。',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-10-03' },
  ],
}

export default function Body() {
  return (
    <>
      <Prose>
        <Code>kintai</Code> は、
        <DocRef kind="ADR" number="0007" /> で Rust で書くと決めた CLI を指す。
        集計、検出、freee
        連携は、設計書「勤怠表と請求書の作成」のコンポーネントを指す。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="ADR" number="0008" /> で、<Code>kintai</Code> が freee
          の API を呼ぶと決めた。 そのため、HTTP
          クライアントのクレートと、同期と非同期のどちらで構成するかを決める必要がある。
          所有者は <Code>kintai</Code>{' '}
          以外の機能も作る見込みが高く、それらの部品は Web API
          とも共有する予定がある。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="ADR" number="0007" />、
          <DocRef kind="ADR" number="0008" />{' '}
          と所有者へのヒアリングから、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>
            freee 連携などの部品を、CLI と今後の Web API の両方から使える。
          </Item>
          <Item>集計と検出は、ユニットテストで守れる。</Item>
          <Item>
            導入範囲「すべて」で、所有者のマシンに Home Manager で導入できる。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          <Code>kintai</Code> は非同期で構成する。 ランタイムには tokio を、HTTP
          クライアントには reqwest を使い、TLS には rustls を使う。
          認可コードの待ち受けには、tokio の TcpListener を使う。
        </Prose>
        <Prose>外部と通信しない集計と検出は、同期の関数のままにする。</Prose>
        <Prose>そのほかの依存には、次のクレートを使う。</Prose>
        <Bullets>
          <Item label="引数の解析">clap</Item>
          <Item label="日付と時刻">chrono</Item>
          <Item label="Org 形式の解析">regex</Item>
          <Item label="TOML と JSON">serde、toml、serde_json</Item>
          <Item label="状態ファイルの置き換え">tempfile</Item>
          <Item label="エラーの型">thiserror</Item>
        </Bullets>
        <Figure caption="外部と通信する処理だけを非同期にし、計算は同期のままにする。">
          <FigSvg
            height={190}
            label="外部と通信する処理を tokio と reqwest で非同期にし、集計と検出は同期のままにする構成"
          >
            <FigNode
              x={0}
              y={20}
              w={420}
              h={150}
              tone="ghost"
              tag="非同期（tokio のランタイム）"
            />
            <FigNode
              x={20}
              y={76}
              w={180}
              h={74}
              tone="neon"
              title="freee の API"
              lines={['reqwest と rustls']}
            />
            <FigNode
              x={220}
              y={76}
              w={180}
              h={74}
              tone="neon"
              title="認可コードの待受"
              lines={['tokio の TcpListener']}
            />
            <FigArrow
              points={[
                [480, 95],
                [424, 95],
              ]}
              tone="soft"
            />
            <FigNode
              x={484}
              y={40}
              w={276}
              h={110}
              title="同期のままにする処理"
              lines={['集計', '検出']}
            />
          </FigSvg>
          <FigChips
            items={[
              'clap 引数',
              'chrono 日付',
              'regex Org 解析',
              'serde と toml',
              'serde_json',
              'tempfile 置き換え',
              'thiserror エラー',
            ]}
          />
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>
            Rust の主な Web フレームワークは tokio の上で動くため、freee
            連携などの部品を、今後の Web API と同じ基盤で共有できる。
          </Item>
          <Item>
            非同期は呼び出し元へ広がるため、共通の部品は最初から非同期で作るほうが、後から作り直すより手戻りが小さい。
          </Item>
          <Item>
            集計と検出を同期の関数に保つため、CLI と Web API
            のどちらからも呼べ、テストも単純なままで済む。
          </Item>
          <Item>
            reqwest は Rust の HTTP
            クライアントとして広く使われ、今後ほかの外部の API
            を呼ぶときにも使える。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: '同期で構成し、ureq を使う案',
              reason:
                '依存は少ない。しかし Web API と共有するには、呼び出しを包むか、非同期の版を別に持つ必要がある。',
            },
            {
              option: 'reqwest の blocking 版を使う案',
              reason:
                '内部で tokio を動かすため、依存は減らない。また、tokio の上で動く Web API から呼ぶと実行時エラーになる。',
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            同期で構成するより依存が増え、ビルドの時間とバイナリが大きくなる。
          </Item>
          <Item>
            依存のクレートが多いぶん、nix 側のハッシュを更新する機会が増える。
          </Item>
          <Item>
            freee を差し替えるための trait は、async のメソッドを持つ。
          </Item>
          <Item>CLI の入口は、tokio のランタイムの上で起動する。</Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'ADR 0007「勤怠表の CLI を Rust で書き、Typst を組み込んで PDF を生成する」',
              href: '/adr/0007_use-rust-and-typst-for-kintai-cli',
            },
            {
              text: 'ADR 0008「freee の請求書の下書きは kintai が freee の API を呼んで作る」',
              href: '/adr/0008_call-freee-api-from-kintai',
            },
            { text: '所有者へのヒアリング（2026-10-03）' },
          ]}
        />
      </DocSection>
    </>
  )
}
